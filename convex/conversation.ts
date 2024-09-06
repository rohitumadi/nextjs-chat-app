import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./user";

export const getConversationById = query({
  args: v.object({
    conversationId: v.id("conversations"),
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
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("Conversation not found");
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
    const allMembers = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect(); //get all members of the conversation can be a group or a private chat

    if (!conversation.isGroup) {
      const otherMember = allMembers.find(
        (member) => member.memberId !== currentUser._id
      );
      if (!otherMember) {
        throw new ConvexError("Other member not found");
      }
      const otherUser = await ctx.db.get(otherMember.memberId);
      if (!otherUser) {
        throw new ConvexError("Other user not found");
      }
      return {
        conversation,
        otherUser: {
          ...otherUser,
          lastSeenMessageId: otherMember.lastSeenMessageId,
        },
        otherMembers: null,
      };
    } else {
      const otherMembers = allMembers.filter(
        (member) => member.memberId !== currentUser._id
      );
      const otherMembersDetails = await Promise.all(
        otherMembers.map(async (member) => {
          const otherUser = await ctx.db.get(member.memberId);
          if (!otherUser) {
            throw new ConvexError("Other user not found");
          }
          return {
            ...otherUser,
            lastSeenMessageId: member.lastSeenMessageId,
          };
        })
      );

      return {
        conversation,
        otherUser: null,
        otherMembers: otherMembersDetails,
      };
    }
  },
});

export const createGroupConversation = mutation({
  args: {
    name: v.string(),
    memberId: v.array(v.id("users")),
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
    //check if group name is unique
    const conversations = await ctx.db
      .query("conversations")
      .withSearchIndex("search_by_name", (q) => q.search("name", args.name))
      .collect();

    if (
      conversations &&
      conversations.some(
        (c) => c.name?.toLowerCase() === args.name?.toLowerCase()
      )
    ) {
      throw new ConvexError("Group name already exists");
    }
    const newGroupId = await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name,
    });

    await Promise.all([
      [...args.memberId, currentUser._id].map(async (memberId) => {
        ctx.db.insert("conversationMembers", {
          conversationId: newGroupId,
          memberId,
        });
      }),
    ]);
  },
});
export const leaveGroup = mutation({
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
    if (!conversationMembers || conversationMembers.length <= 2) {
      throw new ConvexError("conversation not found");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    if (messages.length > 0) {
      await Promise.all([
        messages.map(async (message) => {
          if (message.senderId === currentUser._id) {
            ctx.db.delete(message._id);
          }
        }),
        conversationMembers.map(async (member) => {
          if (member.memberId === currentUser._id) {
            ctx.db.delete(member._id);
          }
        }),
      ]);
    } else {
      await Promise.all([
        conversationMembers.map(async (member) => {
          if (member.memberId === currentUser._id) {
            ctx.db.delete(member._id);
          }
        }),
      ]);
    }
  },
});
export const deleteGroup = mutation({
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

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    if (messages.length > 0) {
      await Promise.all([
        messages.map(async (message) => ctx.db.delete(message._id)),
        ctx.db.delete(conversation._id),
        conversationMembers.map(async (member) => ctx.db.delete(member._id)),
      ]);
    } else {
      await Promise.all([
        ctx.db.delete(conversation._id),
        conversationMembers.map(async (member) => ctx.db.delete(member._id)),
      ]);
    }
  },
});
