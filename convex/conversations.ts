import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./user";

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
        if (conversation.isGroup) return { conversation };
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
          };
        }
      })
    );

    return conversationsWithDetails;
  },
});
