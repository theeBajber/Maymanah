import "server-only";

import { mpesaBaseUrl } from "./donations";

export type MpesaTransactionType = "CustomerPayBillOnline" | "CustomerBuyGoodsOnline";
export type MpesaStatus = "COMPLETED" | "FAILED" | "PENDING";

const MPESA_TRANSACTION_TYPES: readonly MpesaTransactionType[] = [
  "CustomerPayBillOnline",
  "CustomerBuyGoodsOnline",
];

const MPESA_FAILURE_CODES = new Set([
  "1",
  "1001",
  "1019",
  "1025",
  "1032",
  "1037",
  "2001",
  "9999",
]);

const MPESA_RESULT_HINTS: Record<string, string> = {
  "0": "Payment completed",
  "1": "Insufficient funds",
  "1001": "Unable to lock the subscriber",
  "1019": "Transaction expired",
  "1025": "Unable to process the request",
  "1032": "Cancelled by the user",
  "1037": "Timed out waiting for the user",
  "2001": "Wrong PIN entered",
  "9999": "General provider error",
};

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passkey: string;
  callbackUrl: string;
  transactionType: MpesaTransactionType;
  partyB: string;
}

/** Reads the M-Pesa configuration, or explains what is missing. */
export function mpesaConfig(): { ok: true; config: MpesaConfig } | { ok: false; error: string } {
  const {
    MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET,
    MPESA_SHORTCODE,
    MPESA_PASSKEY,
    MPESA_CALLBACK_URL,
    MPESA_TRANSACTION_TYPE,
    MPESA_PARTYB,
  } = process.env;

  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    return { ok: false, error: "M-Pesa payments are not connected yet" };
  }
  if (!MPESA_SHORTCODE || !MPESA_PASSKEY || !MPESA_CALLBACK_URL) {
    return { ok: false, error: "M-Pesa payments are not connected yet" };
  }

  const transactionType = (MPESA_TRANSACTION_TYPE?.trim() || "CustomerPayBillOnline") as MpesaTransactionType;
  if (!MPESA_TRANSACTION_TYPES.includes(transactionType)) {
    return {
      ok: false,
      error: "MPESA_TRANSACTION_TYPE must be CustomerPayBillOnline or CustomerBuyGoodsOnline",
    };
  }

  const partyB = MPESA_PARTYB?.trim() || MPESA_SHORTCODE.trim();
  if (!/^\d+$/.test(partyB)) {
    return { ok: false, error: "MPESA_PARTYB must be a numeric shortcode or till number" };
  }

  return {
    ok: true,
    config: {
      consumerKey: MPESA_CONSUMER_KEY,
      consumerSecret: MPESA_CONSUMER_SECRET,
      shortCode: MPESA_SHORTCODE.trim(),
      passkey: MPESA_PASSKEY,
      callbackUrl: MPESA_CALLBACK_URL,
      transactionType,
      partyB,
    },
  };
}

async function readBody(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) return {};

  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return { raw: text.slice(0, 300) };
  }
}

function failureDetail(body: Record<string, unknown>): string {
  return ["errorCode", "errorMessage", "ResponseDescription", "ResultDesc", "raw"]
    .map((key) => body[key])
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map(String)
    .join(": ");
}

function failureSuffix(body: Record<string, unknown>): string {
  const detail = failureDetail(body);
  return detail ? ` (${detail})` : "";
}

/** An OAuth token for the Safaricom API, good for one session of calls. */
export async function mpesaAccessToken(config: MpesaConfig): Promise<string> {
  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");

  const response = await fetch(`${mpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
    signal: AbortSignal.timeout(15_000),
  });
  const body = await readBody(response);

  if (!response.ok || typeof body.access_token !== "string") {
    throw new Error(`M-Pesa authorisation failed${failureSuffix(body)}`);
  }

  return body.access_token;
}

export interface StkRequest {
  shortCode: string;
  passkey: string;
  timestamp: string;
  amountKes: number;
  phone: string;
  callbackUrl: string;
  transactionType: MpesaTransactionType;
  partyB: string;
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
      TransactionType: request.transactionType,
      Amount: request.amountKes,
      PartyA: request.phone,
      PartyB: Number(request.partyB),
      PhoneNumber: request.phone,
      CallBackURL: request.callbackUrl,
      AccountReference: "Maymanah",
      TransactionDesc: "Donation to Maymanah",
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const body = await readBody(response);

  if (String(body.ResponseCode) !== "0" || typeof body.CheckoutRequestID !== "string") {
    throw new Error(`M-Pesa did not accept the payment request${failureSuffix(body)}`);
  }

  return { checkoutRequestId: body.CheckoutRequestID };
}

export interface StkQueryRequest {
  shortCode: string;
  passkey: string;
  timestamp: string;
  checkoutRequestId: string;
}

export interface StkQueryResult {
  resultCode: string;
  resultDescription: string;
  status: MpesaStatus;
}

export function mpesaStatusFromResultCode(resultCode: string | number): MpesaStatus {
  const code = String(resultCode);

  if (code === "0") return "COMPLETED";
  if (MPESA_FAILURE_CODES.has(code)) return "FAILED";
  return "PENDING";
}

export function mpesaResultHint(resultCode: string | number): string | undefined {
  return MPESA_RESULT_HINTS[String(resultCode)];
}

export async function queryStkStatus(token: string, request: StkQueryRequest): Promise<StkQueryResult> {
  const password = Buffer.from(`${request.shortCode}${request.passkey}${request.timestamp}`).toString("base64");

  const response = await fetch(`${mpesaBaseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: Number(request.shortCode),
      Password: password,
      Timestamp: request.timestamp,
      CheckoutRequestID: request.checkoutRequestId,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = await readBody(response);

  if (!response.ok) {
    throw new Error(`M-Pesa could not report the request status${failureSuffix(body)}`);
  }

  const resultCode = String(body.ResultCode ?? "");
  if (!resultCode) {
    if (body.ResponseCode !== undefined && String(body.ResponseCode) !== "0") {
      throw new Error(`M-Pesa could not report the request status${failureSuffix(body)}`);
    }

    return {
      resultCode: "",
      resultDescription: String(body.ResponseDescription ?? "The payment is still being processed"),
      status: "PENDING",
    };
  }

  return {
    resultCode,
    resultDescription: String(body.ResultDesc ?? body.ResponseDescription ?? ""),
    status: mpesaStatusFromResultCode(resultCode),
  };
}
