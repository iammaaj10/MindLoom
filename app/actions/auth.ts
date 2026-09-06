'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/connection';
import User from '@/lib/db/models/user';
import { createSession, deleteSession } from '@/lib/auth/session';
import {
  SignupFormSchema,
  LoginFormSchema,
  FormState,
} from '@/lib/definitions';

/**
 * Server Action: Sign up a new user.
 * Validates form → hashes password → creates user in MongoDB → creates JWT session → redirects.
 */
export async function signup(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  // 2. Connect to database
  await dbConnect();

  // 3. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return {
      message: 'An account with this email already exists.',
    };
  }

  // 4. Hash the password
  const passwordHash = await bcrypt.hash(password, 12);

  // 5. Create the user
  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    };
  }

  // 6. Create session and redirect
  await createSession(user._id.toString(), user.name, user.email);
  redirect('/dashboard');
}

/**
 * Server Action: Log in an existing user.
 * Validates form → finds user → compares password → creates JWT session → redirects.
 */
export async function login(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  // 2. Connect to database
  await dbConnect();

  // 3. Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return {
      message: 'Invalid email or password.',
    };
  }

  // 4. Compare password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return {
      message: 'Invalid email or password.',
    };
  }

  // 5. Create session and redirect
  await createSession(user._id.toString(), user.name, user.email);
  redirect('/dashboard');
}

/**
 * Server Action: Log out the current user.
 * Deletes the session cookie and redirects to login.
 */
export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
