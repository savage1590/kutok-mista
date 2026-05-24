"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "kutok_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 1 week

export async function loginAdmin(password: string, locale: string) {
  const correctPassword = process.env.ADMIN_PASSWORD;
  
  if (!correctPassword) {
    throw new Error("Admin password not configured on server.");
  }

  if (password !== correctPassword) {
    return { error: "Неправильний пароль" };
  }

  // Create a simple session token (in a real app, use JWT or proper encryption)
  // Here we just set a verified flag since it's a single-user MVP
  const sessionToken = Buffer.from(correctPassword).toString('base64');
  
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect(`/${locale}/admin`);
}

export async function logoutAdmin(locale: string) {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect(`/${locale}/admin/login`);
}

export async function verifyAdminAccess() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (!sessionToken || !correctPassword) {
    return false;
  }

  const expectedToken = Buffer.from(correctPassword).toString('base64');
  return sessionToken === expectedToken;
}
