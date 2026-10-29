#!/usr/bin/env node
import "dotenv/config";

import net from "node:net";
import { parseArgs } from "node:util";

net.setDefaultAutoSelectFamily(false);

const args = process.argv.slice(2);
if (args[0] === "--") args.shift();

const { values } = parseArgs({
  args,
  options: {
    amount: { type: "string", default: "1" },
    phone: { type: "string" },
    query: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help) {
  console.log(`Usage:
  pnpm mpesa:test -- --amount 1 --phone 2547XXXXXXXX
  pnpm mpesa:test -- --query <CheckoutRequestID>

Uses the M-Pesa credentials in .env. It never writes to the database.`);
  process.exit(0);
}

const env = process.env;
const baseUrl =
  env.MPESA_BASE_URL?.replace(/\/$/, "") ??
  (env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke");

const required = [
  "MPESA_CONSUMER_KEY",
  "MPESA_CONSUMER_SECRET",
  "MPESA_SHORTCODE",
  "MPESA_PASSKEY",
  "MPESA_CALLBACK_URL",
];
const missing = required.filter((key) => !env[key]?.trim());
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const transactionType = env.MPESA_TRANSACTION_TYPE?.trim() || "CustomerPayBillOnline";
if (!["CustomerPayBillOnline", "CustomerBuyGoodsOnline"].includes(transactionType)) {
  console.error("MPESA_TRANSACTION_TYPE must be CustomerPayBillOnline or CustomerBuyGoodsOnline");
  process.exit(1);
}

const shortCode = env.MPESA_SHORTCODE.trim();
const partyB = (env.MPESA_PARTYB?.trim() || shortCode).trim();
if (!/^\d+$/.test(partyB)) {
  console.error("MPESA_PARTYB must be a numeric shortcode or till number");
  process.exit(1);
}

function timestamp() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}

function password(time) {
  return Buffer.from(`${shortCode}${env.MPESA_PASSKEY}${time}`).toString("base64");
}

function normalizePhone(input) {
  const digits = String(input ?? "").replace(/[^\d]/g, "");
  const normalized = digits.startsWith("0")
    ? `254${digits.slice(1)}`
    : digits.startsWith("254")
      ? digits
      : "";
  return /^254[17]\d{8}$/.test(normalized) ? normalized : null;
}

function maskPhone(phone) {
  return `${phone.slice(0, 6)}****${phone.slice(-2)}`;
}

async function readBody(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 500) };
  }
}

async function accessToken() {
  const credentials = Buffer.from(
    `${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`,
  ).toString("base64");
  const response = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      signal: AbortSignal.timeout(15_000),
    },
  );
  const body = await readBody(response);
  if (!response.ok || typeof body.access_token !== "string") {
    throw new Error(`Token request failed (HTTP ${response.status}): ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

function explainError(error) {
  const cause = error?.cause;
  const code = String(cause?.code ?? error?.code ?? "");
  if (code === "UND_ERR_CONNECT_TIMEOUT" || code === "ETIMEDOUT") {
    return `Timed out connecting to ${baseUrl}. Check your network or try again.`;
  }
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
    return `Could not resolve ${baseUrl}. Check your DNS and network.`;
  }
  return error instanceof Error ? error.message : String(error);
}

function fail(error) {
  console.error(`M-Pesa diagnostic failed: ${explainError(error)}`);
  process.exit(1);
}

const time = timestamp();

console.log("M-Pesa diagnostic");
console.log(`  Environment:     ${env.MPESA_ENV ?? "sandbox"}`);
console.log(`  Base URL:        ${baseUrl}`);
console.log(`  Shortcode:       ${shortCode}`);
console.log(`  Transaction:     ${transactionType}`);
console.log(`  Party B:         ${partyB}`);
console.log(`  Callback:        ${env.MPESA_CALLBACK_URL}`);
console.log("");

let token;
try {
  token = await accessToken();
} catch (error) {
  fail(error);
}

if (values.query) {
  try {
    const response = await fetch(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: Number(shortCode),
        Password: password(time),
        Timestamp: time,
        CheckoutRequestID: values.query,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = await readBody(response);
    console.log(`HTTP ${response.status}`);
    console.log(JSON.stringify(body, null, 2));
    process.exit(response.ok ? 0 : 1);
  } catch (error) {
    fail(error);
  }
}

const phone = normalizePhone(values.phone);
if (!phone) {
  console.error("Pass --phone with a Safaricom number, for example 254712345678");
  process.exit(1);
}

const amount = Number(values.amount);
if (!Number.isInteger(amount) || amount < 1) {
  console.error("Pass --amount as a whole number of shillings");
  process.exit(1);
}

let response;
try {
  response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: Number(shortCode),
      Password: password(time),
      Timestamp: time,
      TransactionType: transactionType,
      Amount: amount,
      PartyA: phone,
      PartyB: Number(partyB),
      PhoneNumber: phone,
      CallBackURL: env.MPESA_CALLBACK_URL,
      AccountReference: "Maymanah",
      TransactionDesc: "Donation to Maymanah test",
    }),
    signal: AbortSignal.timeout(20_000),
  });
} catch (error) {
  fail(error);
}

const body = await readBody(response);
console.log(`Phone: ${maskPhone(phone)}`);
console.log(`Amount: KES ${amount}`);
console.log(`HTTP ${response.status}`);
console.log(JSON.stringify(body, null, 2));

if (body.CheckoutRequestID) {
  console.log("");
  console.log("Check the result with:");
  console.log(`  pnpm mpesa:test -- --query ${body.CheckoutRequestID}`);
}

process.exit(response.ok && body.ResponseCode === "0" ? 0 : 1);
