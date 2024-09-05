import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserByClerkId } from "./user";
export const removeFriend = mutation({
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
    //delete friendship
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("conversation not found");
    }

    const conversationMembers = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
    if (!conversationMembers || conversationMembers.length !== 2) {
      throw new ConvexError("conversation not found");
    }

    const friendship = await ctx.db
      .query("friends")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .unique();
    if (!friendship) {
      throw new ConvexError("friendship not found");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    if (messages.length > 0) {
      await Promise.all([
        messages.map(async (message) => ctx.db.delete(message._id)),
        ctx.db.delete(friendship._id),
        ctx.db.delete(conversation._id),
        conversationMembers.map(async (member) => ctx.db.delete(member._id)),
      ]);
    } else {
      await Promise.all([
        ctx.db.delete(friendship._id),
        ctx.db.delete(conversation._id),
        conversationMembers.map(async (member) => ctx.db.delete(member._id)),
      ]);
    }
  },
});
