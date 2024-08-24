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
    .index("by_clerkId", ["clerkId"]), //index make it faster to query n optimize the db
});
