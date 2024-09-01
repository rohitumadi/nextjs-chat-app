import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserByClerkId } from "./user";
export const createMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    type: v.string(),
    content: v.array(v.string()),
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
    const message = await ctx.db.insert("messages", {
      content: args.content,
      type: args.type,
      conversationId: args.conversationId,
      senderId: currentUser._id,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageId: message,
    });
    return message;
  },
});
