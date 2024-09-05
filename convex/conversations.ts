import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./user";
import { v } from "convex/values";

export const getConversations = query({
  handler: async (ctx) => {
    const sender = await ctx.auth.getUserIdentity();
    if (!sender) {
      throw new ConvexError("Not authenticated");
    }
    const currentUser = await getUserByClerkId(ctx, {
      clerkId: sender.subject,
    });
    if (!currentUser) {
      throw new ConvexError("User not found");
    }
    const conversationsMembers = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    const conversations = await Promise.all(
      conversationsMembers.map(async (conversationMember) => {
        const conversation = await ctx.db.get(
          conversationMember.conversationId
        );
        if (!conversation) {
          throw new ConvexError("Conversation not found");
        }
        return conversation;
      })
    );
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation, index) => {
        const members = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .collect();
        const lastMessage =
          conversation.lastMessageId &&
          (await getLastMessageDetails(ctx, {
            messageId: conversation.lastMessageId,
          }));
        if (conversation.isGroup) return { conversation, lastMessage };
        else {
          const otherMember = members.find(
            (member) => member.memberId !== currentUser._id
          );
          // The '!' is a non-null assertion operator in TypeScript
          // It tells the compiler that we're certain otherMember is not null or undefined
          // We use it here because we're confident that in a non-group conversation,
          // there will always be another member
          const otherUser = await ctx.db.get(otherMember!.memberId);
          return {
            conversation,
            otherUser,
            lastMessage,
          };
        }
      })
    );

    return conversationsWithDetails;
  },
});

export const getLastMessageDetails = query({
  args: v.object({
    messageId: v.id("messages"),
  }),
  handler: async (ctx, args) => {
    const sender = await ctx.auth.getUserIdentity();
    if (!sender) {
      throw new ConvexError("Not authenticated");
    }
    const currentUser = await getUserByClerkId(ctx, {
      clerkId: sender.subject,
    });
    if (!currentUser) {
      throw new ConvexError("User not found");
    }
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError("Message not found");
    }
    const messageSender = await ctx.db.get(message.senderId);
    if (!messageSender) {
      throw new ConvexError("Message sender not found");
    }

    return { message, messageSender };
  },
});
