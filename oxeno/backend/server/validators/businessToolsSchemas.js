import { z } from "zod";

const optionalText = (maxLength) =>
  z
    .string()
    .trim()
    .max(maxLength, `Must be ${maxLength} characters or fewer.`)
    .optional()
    .transform((value) => value || null);

const requiredText = (field, maxLength) =>
  z
    .string({ error: `${field} is required.` })
    .trim()
    .min(1, `${field} is required.`)
    .max(maxLength, `${field} must be ${maxLength} characters or fewer.`);

export const awardLoyaltyPointsSchema = z.object({
  customerId: z.string().uuid("Select a valid customer."),
  loyaltyProgramId: z.string().uuid("Select a valid loyalty program.").optional(),
  points: z.coerce
    .number({ error: "Points are required." })
    .int("Points must be a whole number.")
    .min(1, "Points must be at least 1.")
    .max(100_000, "Points cannot exceed 100,000 at one time."),
  note: optionalText(300),
});

export const createOfferSchema = z.object({
  title: requiredText("Offer title", 120),
  description: optionalText(600),
  discountLabel: requiredText("Discount", 60),
  couponCode: optionalText(40).transform((value) => value?.toUpperCase() || null),
  expiresAt: z
    .string({ error: "Offer expiry is required." })
    .trim()
    .refine(
      (value) => !Number.isNaN(Date.parse(value)) && new Date(value).getTime() > Date.now(),
      "Offer expiry must be a future date and time.",
    ),
});
