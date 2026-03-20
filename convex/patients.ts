import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPatients = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("patients").collect();
  },
});

export const getPatient = query({
    args: { id: v.id("patients") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }
});

export const addPatient = mutation({
  args: {
    firstName: v.string(),
    surname: v.string(),
    dob: v.string(),
    gender: v.string(),
    phone: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("patients", {
        ...args,
        status: "registered"
    });
  },
});

export const updatePatient = mutation({
  args: {
    id: v.id("patients"),
    updates: v.object({
        firstName: v.optional(v.string()),
        surname: v.optional(v.string()),
        dob: v.optional(v.string()),
        gender: v.optional(v.string()),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        height: v.optional(v.number()),
        weight: v.optional(v.number()),
        bmi: v.optional(v.number()),
        bpSystolic: v.optional(v.number()),
        bpDiastolic: v.optional(v.number()),
        pulse: v.optional(v.number()),
        bloodSugar: v.optional(v.number()),
        cholesterol: v.optional(v.number()),
        status: v.optional(v.string()),
    })
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.updates);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const deletePatient = mutation({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const saveReportId = mutation({
  args: {
    patientId: v.id("patients"),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.patientId, { reportFileId: args.storageId });
  },
});

export const getReportUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
