import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./user";
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
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
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) =>
        q
          .eq("memberId", currentUser._id)
          .eq("conversationId", args.conversationId)
      )
      .unique(); //check if the current user is a member of the conversation
    if (!membership) {
      throw new ConvexError("You are not a member of this conversation");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
    const messagesWithUser = await Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.senderId);
        if (!user) {
          throw new ConvexError("User not found");
        }
        return {
          message,
          senderImageUrl: user.imageUrl,
          senderName: user.username,
          isCurrentUser: user._id === currentUser._id,
        };
      })
    );
    return messagesWithUser;
  },
});
