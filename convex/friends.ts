import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./user";

export const getFriends = query({
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
    const friends1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1", currentUser._id))
      .collect();
    const friends2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2", currentUser._id))
      .collect();

    const friendEmails = [];

    for (const friend of friends1) {
      const user = await ctx.db.get(friend.user2);
      if (!user) {
        throw new ConvexError("User not found");
      }
      friendEmails.push(user.email);
    }

    for (const friend of friends2) {
      const user = await ctx.db.get(friend.user1);
      if (!user) {
        throw new ConvexError("User not found");
      }
      friendEmails.push(user.email);
    }

    return friendEmails;
  },
});
