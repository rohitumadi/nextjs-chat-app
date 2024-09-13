import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUserByClerkId, getUserByEmail } from "./user";
export const sendRequest = mutation({
  args: {
    emails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const sender = await ctx.auth.getUserIdentity();
    if (!sender) {
      throw new ConvexError("Not authenticated");
    }
    if (args.emails.includes(sender.email ?? "")) {
      throw new ConvexError("Cannot send request to yourself");
    }
    const currentUser = await getUserByClerkId(ctx, {
      clerkId: sender.subject,
    });
    if (!currentUser) {
      throw new ConvexError("User not found");
    }

    for (const email of args.emails) {
      const receiver = await getUserByEmail(ctx, { email });
      if (!receiver) {
        throw new ConvexError("Receiver not found");
      }
      const requestAlreadySent = await ctx.db
        .query("requests")
        .withIndex("by_receiver_sender", (q) =>
          q.eq("receiverId", receiver._id).eq("senderId", currentUser._id)
        )
        .unique();
      if (requestAlreadySent) {
        throw new ConvexError("Request already sent");
      }
    }
    for (const email of args.emails) {
      const receiver = await getUserByEmail(ctx, { email });
      const requestAlreadyReceived = await ctx.db
        .query("requests")
        .withIndex("by_receiver_sender", (q) =>
          q.eq("receiverId", currentUser._id).eq("senderId", receiver!._id)
        )
        .unique();
      if (requestAlreadyReceived) {
        throw new ConvexError("Request already received");
      }
    }

    let requests = [];
    for (const email of args.emails) {
      const receiver = await getUserByEmail(ctx, { email });
      const request = await ctx.db.insert("requests", {
        senderId: currentUser._id,
        receiverId: receiver!._id,
      });
      requests.push(request);
    }
    return requests;
  },
});

export const rejectRequest = mutation({
  args: {
    id: v.id("requests"),
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

    const request = await ctx.db.get(args.id);
    if (!request) {
      throw new ConvexError("Request not found");
    }
    await ctx.db.delete(request._id);
  },
});

export const acceptRequest = mutation({
  args: {
    id: v.id("requests"),
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
    const request = await ctx.db.get(args.id);
    if (!request) {
      throw new ConvexError("Request not found");
    }
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      lastModifiedAt: Date.now(),
    });
    await ctx.db.insert("friends", {
      user1: currentUser._id,
      user2: request.senderId,
      conversationId: conversationId,
    });
    await ctx.db.insert("conversationMembers", {
      memberId: currentUser._id,
      conversationId: conversationId,
    });
    await ctx.db.insert("conversationMembers", {
      memberId: request.senderId,
      conversationId: conversationId,
    });
    await ctx.db.delete(request._id);
  },
});
