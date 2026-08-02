import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validPlans = new Set(["starter", "growth", "pro"]);

function text(field, maxLength = 255) {
  return z
    .string({ error: `${field} is required.` })
    .trim()
    .min(1, `${field} is required.`)
    .max(maxLength, `${field} is too long.`);
}

const email = (field, invalidMessage) =>
  text(field)
    .refine((value) => emailPattern.test(value), invalidMessage)
    .transform((value) => value.toLowerCase());

export const signupSchema = z
  .object({
    businessName: text("Business name"),
    ownerName: text("Owner name"),
    businessEmail: email("Business email", "Enter a valid business email address."),
    mobile: text("Mobile number", 50),
    password: text("Password", 1024).min(8, "Password must be at least 8 characters."),
    confirmPassword: text("Confirm password", 1024),
    businessType: text("Business type", 100),
    country: text("Country", 100),
    state: text("State", 100),
    city: text("City", 100),
    zip: text("ZIP / PIN code", 30),
    address: text("Business address", 500),
    plan: z.string().refine((value) => validPlans.has(value), "Select a valid subscription plan."),
    agreeTerms: z
      .boolean()
      .refine((value) => value, "You must accept the Terms and Privacy Policy."),
    agreePrivacy: z
      .boolean()
      .refine((value) => value, "You must accept the Terms and Privacy Policy."),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: email("Email", "Enter a valid email address."),
  password: text("Password", 1024),
});

export const googleLoginSchema = z.object({
  credential: text("Google credential", 10_000),
});
