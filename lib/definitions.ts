import * as z from 'zod';

// ─── Auth Schemas ────────────────────────────────────────────

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .trim(),
  email: z
    .string()
    .email({ message: 'Please enter a valid email.' })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .regex(/[a-zA-Z]/, { message: 'Must contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Must contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Must contain at least one special character.',
    })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email.' })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .trim(),
});

// ─── Journal Schema ──────────────────────────────────────────

export const JournalEntrySchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Journal entry cannot be empty.' })
    .max(5000, { message: 'Journal entry is too long.' }),
  tags: z.array(z.string()).default([]),
  date: z.string().optional(),
});

// ─── Types ───────────────────────────────────────────────────

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  expiresAt: Date;
};
