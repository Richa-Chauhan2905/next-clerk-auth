import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error("Please add webhook secret in env");

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook", error);
    return new Response("Webhook verification failed", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    try {
      const {
        id,
        first_name,
        last_name,
        email_addresses,
        primary_email_address_id,
        unsafe_metadata,
      } = evt.data;

      const primaryEmail = email_addresses.find(
        (email: any) => email.id === primary_email_address_id
      );

      if (!primaryEmail) {
        return new Response("No primary email found", { status: 400 });
      }

      // save user in Prisma DB including role from publicMetadata
      const newUser = await prisma.user.create({
        data: {
          id,
          email: primaryEmail.email_address,
          first_name: first_name ?? "",
          last_name: last_name ?? "",
          role:
            (unsafe_metadata?.role as import("@prisma/client").Role) || "USER",
        },
      });

      console.log("New user created in DB:", newUser);
      return new Response("User created successfully", { status: 200 });
    } catch (err) {
      console.error("DB error:", err);
      return new Response("Error creating user in database", { status: 500 });
    }
  }

  return new Response("Event ignored", { status: 200 });
}
