import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  //schema for the users table plural is convention
  users: defineTable({
    username: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    email: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_clerkId", ["clerkId"])
    .searchIndex("search_by_username", {
      searchField: "username",
    }),

  requests: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
  })
    .index("by_receiver", ["receiverId"])
    .index("by_receiver_sender", ["receiverId", "senderId"]),

  friends: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    conversationId: v.id("conversations"),
  })
    .index("by_user1", ["user1"])
    .index("by_user2", ["user2"])
    .index("by_conversationId", ["conversationId"]),

  conversations: defineTable({
    name: v.optional(v.string()),
    isGroup: v.boolean(),
    lastMessageId: v.optional(v.id("messages")),
    adminId: v.optional(v.id("users")),
  }).searchIndex("search_by_name", {
    searchField: "name",
  }),

  conversationMembers: defineTable({
    memberId: v.id("users"),
    conversationId: v.id("conversations"),
    lastSeenMessageId: v.optional(v.id("messages")),
  })
    .index("by_memberId", ["memberId"])
    .index("by_conversationId", ["conversationId"])
    .index("by_memberId_conversationId", ["memberId", "conversationId"]),

  messages: defineTable({
    senderId: v.id("users"),
    conversationId: v.id("conversations"),
    type: v.string(),
    content: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_conversationId", ["conversationId"]),
});
