import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  patients: defineTable({
    firstName: v.string(),
    surname: v.string(),
    dob: v.string(),
    gender: v.string(),
    phone: v.string(),
    email: v.string(),
    businessUnit: v.optional(v.string()),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    bmi: v.optional(v.number()),
    bpSystolic: v.optional(v.number()),
    bpDiastolic: v.optional(v.number()),
    pulse: v.optional(v.number()),
    bloodSugar: v.optional(v.number()),
    cholesterol: v.optional(v.number()),
    bloodSugarNotTested: v.optional(v.boolean()),
    cholesterolNotTested: v.optional(v.boolean()),
    status: v.string(),
    reportFileId: v.optional(v.string()),
  }),

  participants: defineTable({
    surname: v.string(),
    firstName: v.string(),
    businessUnit: v.optional(v.string()),
    gender: v.optional(v.string()),
    dob: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_surname", ["surname"]),
});
