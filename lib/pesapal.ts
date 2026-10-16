import "server-only";

import { pesapalBaseUrl } from "./donations";

interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
}

/** Reads the Pesapal configuration, or explains what is missing. */
export function pesapalConfig(): { ok: true; config: PesapalConfig } | { ok: false; error: string } {
  const { PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET } = process.env;

  if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
    return { ok: false, error: "Pesapal payments are not connected yet" };
  }

  return { ok: true, config: { consumerKey: PESAPAL_CONSUMER_KEY, consumerSecret: PESAPAL_CONSUMER_SECRET } };
}

/** A bearer token for the Pesapal API. */
export async function pesapalToken(config: PesapalConfig): Promise<string> {
  const response = await fetch(`${pesapalBaseUrl()}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ consumer_key: config.consumerKey, consumer_secret: config.consumerSecret }),
  });

  if (!response.ok) throw new Error("Pesapal authorisation failed");

  const body = (await response.json()) as { token?: string };
  if (!body.token) throw new Error("Pesapal authorisation returned no token");

  return body.token;
}

/**
 * Registers where Pesapal should send payment notifications.
 *
 * Pesapal requires the notification URL to be registered before an order can
 * reference it, so this runs once per checkout rather than once ever:
 * registering is idempotent and cheap, while a stale registration breaks
 * every payment made after it.
 */
export async function registerPesapalIpn(token: string, ipnUrl: string): Promise<string> {
  const response = await fetch(`${pesapalBaseUrl()}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
  });

  if (!response.ok) throw new Error("Pesapal would not register the notification URL");

  const body = (await response.json()) as { ipn_id?: string };
  if (!body.ipn_id) throw new Error("Pesapal returned no notification id");

  return body.ipn_id;
}

export interface PesapalOrder {
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
  notificationId: string;
  email?: string;
  phone?: string;
  merchantReference: string;
}

/**
 * Submits an order and returns where the donor completes it.
 *
 * The donor leaves for Pesapal's page; the IPN notification records the
 * outcome. The tracking id is returned alongside so the interface can poll
 * for completion.
 */
export async function submitPesapalOrder(
  token: string,
  order: PesapalOrder,
): Promise<{ redirectUrl: string; trackingId: string }> {
  const response = await fetch(`${pesapalBaseUrl()}/api/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      id: order.merchantReference,
      currency: order.currency,
      amount: order.amount,
      description: order.description,
      callback_url: order.callbackUrl,
      notification_id: order.notificationId,
      billing_address: {
        email_address: order.email,
        phone_number: order.phone,
        country_code: "KE",
      },
    }),
  });

  if (!response.ok) throw new Error("Pesapal did not accept the order");

  const body = (await response.json()) as { redirect_url?: string; order_tracking_id?: string };
  if (!body.redirect_url || !body.order_tracking_id) {
    throw new Error("Pesapal returned an incomplete order");
  }

  return { redirectUrl: body.redirect_url, trackingId: body.order_tracking_id };
}

/**
 * Asks Pesapal for the current state of an order.
 *
 * Never trusts the status arriving in a query string or callback: the only
 * source of truth is Pesapal's own API, asked directly.
 */
export async function pesapalOrderStatus(
  token: string,
  trackingId: string,
): Promise<"COMPLETED" | "FAILED" | "PENDING"> {
  const response = await fetch(
    `${pesapalBaseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(trackingId)}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } },
  );

  if (!response.ok) throw new Error("Pesapal would not report the order status");

  const body = (await response.json()) as { status_code?: number };

  // Pesapal reports numeric codes: 1 is completed, anything failed-shaped is
  // failed, and the rest is still in flight.
  const code = body.status_code;
  if (code === 1) return "COMPLETED";
  if (code === 2 || code === 3) return "FAILED";
  return "PENDING";
}
