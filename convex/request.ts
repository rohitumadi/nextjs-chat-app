import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUserByClerkId, getUserByEmail } from "./user";
export const createRequest = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const sender = await ctx.auth.getUserIdentity();
    if (!sender) {
      throw new ConvexError("Not authenticated");
    }
    if (sender.email === args.email) {
      throw new ConvexError("Cannot send request to yourself");
    }
    const currentUser = await getUserByClerkId(ctx, {
      clerkId: sender.subject,
    });
    if (!currentUser) {
      throw new ConvexError("User not found");
    }
    const receiver = await getUserByEmail(ctx, { email: args.email });
    if (!receiver) {
      throw new ConvexError("Receiver not found");
    }
    const requestAlreadySent = await ctx.db
      .query("requests")
      .withIndex("by_receiver_sender", (q) =>
        q.eq("receiverId", receiver._id).eq("senderId", currentUser._id)
      );
    if (requestAlreadySent) {
      throw new ConvexError("Request already sent");
    }
    const requestAlreadyReceived = await ctx.db
      .query("requests")
      .withIndex("by_receiver_sender", (q) =>
        q.eq("receiverId", currentUser._id).eq("senderId", receiver._id)
      );
    if (requestAlreadyReceived) {
      throw new ConvexError("Request already received");
    }
    const request = await ctx.db.insert("requests", {
      senderId: currentUser._id,
      receiverId: receiver._id,
    });
    return request;
  },
});
