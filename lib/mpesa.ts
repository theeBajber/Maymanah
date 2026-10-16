import "server-only";

import { mpesaBaseUrl } from "./donations";

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passkey: string;
  callbackUrl: string;
}

/** Reads the M-Pesa configuration, or explains what is missing. */
export function mpesaConfig(): { ok: true; config: MpesaConfig } | { ok: false; error: string } {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL } = process.env;

  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    return { ok: false, error: "M-Pesa payments are not connected yet" };
  }
  if (!MPESA_SHORTCODE || !MPESA_PASSKEY || !MPESA_CALLBACK_URL) {
    return { ok: false, error: "M-Pesa payments are not connected yet" };
  }

  return {
    ok: true,
    config: {
      consumerKey: MPESA_CONSUMER_KEY,
      consumerSecret: MPESA_CONSUMER_SECRET,
      shortCode: MPESA_SHORTCODE,
      passkey: MPESA_PASSKEY,
      callbackUrl: MPESA_CALLBACK_URL,
    },
  };
}

/** An OAuth token for the Safaricom API, good for one session of calls. */
export async function mpesaAccessToken(config: MpesaConfig): Promise<string> {
  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");

  const response = await fetch(`${mpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });

  if (!response.ok) throw new Error("M-Pesa authorisation failed");

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("M-Pesa authorisation returned no token");

  return body.access_token;
}

export interface StkRequest {
  shortCode: string;
  passkey: string;
  timestamp: string;
  amountKes: number;
  phone: string;
  callbackUrl: string;
}

/**
 * Asks Safaricom to prompt a phone for payment.
 *
 * Returns the checkout request id the callback will reference. Anything else
 * — a non-zero response code, a missing id — is a failure, since polling for
 * a payment that was never requested waits forever.
 */
export async function sendStkPush(
  token: string,
  request: StkRequest,
): Promise<{ checkoutRequestId: string }> {
  const password = Buffer.from(`${request.shortCode}${request.passkey}${request.timestamp}`).toString("base64");

  const response = await fetch(`${mpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: Number(request.shortCode),
      Password: password,
      Timestamp: request.timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: request.amountKes,
      PartyA: request.phone,
      PartyB: Number(request.shortCode),
      PhoneNumber: request.phone,
      CallBackURL: request.callbackUrl,
      AccountReference: "Maymanah",
      TransactionDesc: "Donation to Maymanah",
    }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    ResponseCode?: string;
    CheckoutRequestID?: string;
    errorMessage?: string;
  };

  if (body.ResponseCode !== "0" || !body.CheckoutRequestID) {
    throw new Error(body.errorMessage ?? "M-Pesa did not accept the payment request");
  }

  return { checkoutRequestId: body.CheckoutRequestID };
}
