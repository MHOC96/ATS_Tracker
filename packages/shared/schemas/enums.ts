import { z } from "zod";

export const jobTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "CONTRACT",
  "TEMPORARY",
]);

export const jobStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
]);

export const applicationStatusSchema = z.enum([
  "APPLIED",
  "PROCESSING",
  "AI_REVIEWED",
  "MANUAL_REVIEW",
  "SHORTLISTED",
  "INTERVIEW",
  "ON_HOLD",
  "REJECTED",
  "HIRED",
]);

export const userRoleSchema = z.enum(["ADMIN", "RECRUITER", "REVIEWER"]);

export const recommendationSchema = z.enum([
  "STRONG_MATCH",
  "MATCH",
  "BORDERLINE",
  "WEAK_MATCH",
]);
