import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const genders = new Set(["male", "female", "non_binary", "prefer_not_to_say", "other"]);

function text(field, maxLength = 255) {
  return z
    .string({ error: `${field} is required.` })
    .trim()
    .min(1, `${field} is required.`)
    .max(maxLength, `${field} is too long.`);
}

function isCalendarDate(value) {
  if (!datePattern.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

const email = text("Email")
  .refine((value) => emailPattern.test(value), "Enter a valid email address.")
  .transform((value) => value.toLowerCase());

const date = (field) => text(field, 10).refine(isCalendarDate, `${field} must be a valid date.`);

const optionalDate = (field) =>
  z
    .string({ error: `${field} must be a valid date.` })
    .trim()
    .optional()
    .transform((value) => value || null)
    .refine((value) => value === null || isCalendarDate(value), `${field} must be a valid date.`);

export const customerSignupSchema = z
  .object({
    businessId: z.string().uuid("Select a valid business."),
    fullName: text("Full name"),
    email,
    whatsappNumber: text("WhatsApp number", 50),
    birthDate: date("Date of birth"),
    isMarried: z.boolean({ error: "Select your marital status." }),
    anniversaryDate: optionalDate("Anniversary date"),
    gender: z.string().refine((value) => genders.has(value), "Select a valid gender."),
    city: text("City", 100),
    password: text("Password", 1024).min(8, "Password must be at least 8 characters."),
    confirmPassword: text("Confirm password", 1024),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }

    if (data.isMarried && !data.anniversaryDate) {
      context.addIssue({
        code: "custom",
        message: "Anniversary date is required for married customers.",
        path: ["anniversaryDate"],
      });
    }
  });

export const customerLoginSchema = z.object({
  email,
  password: text("Password", 1024),
});

export const businessQuerySchema = z.object({
  category: text("Business category", 100),
});
