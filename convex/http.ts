import { internal } from "./_generated/api";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { httpAction } from "./_generated/server";
import { WebhookEvent } from "@clerk/nextjs/server";

const validatePayload = async (
  request: Request
): Promise<WebhookEvent | undefined> => {
  const payload = await request.text();
  const svixHeaders = {
    "svix-id": request.headers.get("svix-id")!,
    "svix-timestamp": request.headers.get("svix-timestamp")!,
    "svix-signature": request.headers.get("svix-signature")!,
  };
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return;
  }
  const webhook = new Webhook(webhookSecret);
  try {
    return webhook.verify(payload, svixHeaders) as WebhookEvent;
  } catch (error) {
    console.error("Failed to verify webhook", error);
    return;
  }
};

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validatePayload(request);
  if (!event) {
    return new Response("Invalid payload", { status: 400 });
  }

  if (event.type === "user.created") {
    const user = await ctx.runQuery(internal.user.getUserByClerkId, {
      clerkId: event.data.id,
    });
    if (user) {
      console.log("User already exists", user);
      return new Response("User already exists", { status: 200 });
    }
    await ctx.runMutation(internal.user.createUser, {
      clerkId: event.data.id,
      email: event.data.email_addresses[0].email_address,
      username:
        event.data.first_name && event.data.last_name
          ? `${event.data.first_name} ${event.data.last_name}`.trim()
          : event.data.username || "",
      imageUrl: event.data.image_url,
    });
    console.log(
      `User ${event.type === "user.created" ? "created" : "updated"}`,
      event.data.id
    );
  } else if (event.type === "user.updated") {
    console.log("User updated", event.data.id);
  }
  return new Response("OK", { status: 200 });
});

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
