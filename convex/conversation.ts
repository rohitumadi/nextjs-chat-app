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
      // const otherMembers = allMembers.filter(
      //   (member) => member.memberId !== currentUser._id
      // );
      const allMembersDetails = await Promise.all(
        allMembers.map(async (member) => {
          const user = await ctx.db.get(member.memberId);
          if (!user) {
            throw new ConvexError("user not found");
          }
          return {
            ...user,
            lastSeenMessageId: member.lastSeenMessageId,
          };
        })
      );

      return {
        conversation,
        otherUser: null,
        otherMembers: allMembersDetails,
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
      adminId: currentUser._id,
      lastModifiedAt: Date.now(),
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

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("conversation not found");
    }
    if (conversation.adminId === currentUser._id) {
      deleteGroup(ctx, { conversationId: args.conversationId });
      return;
    }

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) =>
        q
          .eq("memberId", currentUser._id)
          .eq("conversationId", args.conversationId)
      )
      .unique();
    if (!membership) {
      throw new ConvexError("You are not a member of this group");
    }

    await ctx.db.delete(membership._id);
  },
});
export const addFriendsToGroup = mutation({
  args: {
    conversationId: v.id("conversations"),
    friendsIds: v.array(v.id("users")),
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

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("conversation not found");
    }
    if (conversation.adminId !== currentUser._id) {
      throw new ConvexError("You are not the admin of this group");
    }

    Promise.all(
      args.friendsIds.map(async (friendId) => {
        ctx.db.insert("conversationMembers", {
          conversationId: args.conversationId,
          memberId: friendId,
        });
      })
    );
  },
});
export const removeFriendsFromGroup = mutation({
  args: {
    conversationId: v.id("conversations"),
    friendId: v.id("users"),
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

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("conversation not found");
    }
    if (conversation.adminId !== currentUser._id) {
      throw new ConvexError("You are not the admin of this group");
    }
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) =>
        q
          .eq("memberId", args.friendId)
          .eq("conversationId", args.conversationId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("Friend is not a member of this group");
    }

    ctx.db.delete(membership?._id);
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

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("conversation not found");
    }
    if (conversation.adminId !== currentUser._id) {
      throw new ConvexError("You are not the admin of this group");
    }

    const conversationMembers = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
    if (!conversationMembers) {
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
export const markRead = mutation({
  args: {
    lastMessageId: v.id("messages"),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    console.log("mark red");
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
      throw new ConvexError("conversation not found");
    }

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) =>
        q
          .eq("memberId", currentUser._id)
          .eq("conversationId", args.conversationId)
      )
      .unique();
    if (!membership) {
      throw new ConvexError("You are not a member of this group");
    }
    const lastMessage = await ctx.db.get(args.lastMessageId);
    await ctx.db.patch(membership._id, {
      lastSeenMessageId: lastMessage ? lastMessage._id : undefined,
    });
  },
});
