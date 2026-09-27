import { db } from "@/db";
import { dressSubscribers } from "@/db/schema";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const value = (payload as Record<string, unknown>).email;
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    await db
      .insert(dressSubscribers)
      .values({ email })
      .onConflictDoNothing({ target: dressSubscribers.email });

    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Unable to save newsletter subscription:", error);
    return Response.json(
      { error: "We couldn't sign you up just now. Please try again." },
      { status: 500 },
    );
  }
}
