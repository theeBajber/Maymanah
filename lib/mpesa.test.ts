import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  mpesaConfig,
  mpesaResultHint,
  mpesaStatusFromResultCode,
  queryStkStatus,
  sendStkPush,
} from "./mpesa";

const pristineEnv = { ...process.env };

beforeEach(() => {
  process.env = {
    ...pristineEnv,
    MPESA_CONSUMER_KEY: "consumer-key",
    MPESA_CONSUMER_SECRET: "consumer-secret",
    MPESA_SHORTCODE: "123456",
    MPESA_PASSKEY: "passkey",
    MPESA_CALLBACK_URL: "https://example.com/api/donations/webhook",
    MPESA_ENV: "production",
  };
  delete process.env.MPESA_TRANSACTION_TYPE;
  delete process.env.MPESA_PARTYB;
  delete process.env.MPESA_BASE_URL;
});

afterEach(() => {
  process.env = { ...pristineEnv };
  vi.restoreAllMocks();
});

describe("mpesaConfig", () => {
  it("defaults to a PayBill using the shortcode as Party B", () => {
    const config = mpesaConfig();

    expect(config.ok).toBe(true);
    if (!config.ok) return;

    expect(config.config.transactionType).toBe("CustomerPayBillOnline");
    expect(config.config.partyB).toBe("123456");
  });

  it("uses the configured Buy Goods transaction type and till", () => {
    process.env.MPESA_TRANSACTION_TYPE = "CustomerBuyGoodsOnline";
    process.env.MPESA_PARTYB = "654321";

    const config = mpesaConfig();

    expect(config.ok).toBe(true);
    if (!config.ok) return;

    expect(config.config.transactionType).toBe("CustomerBuyGoodsOnline");
    expect(config.config.partyB).toBe("654321");
  });

  it("falls back to the shortcode when Party B is blank", () => {
    process.env.MPESA_PARTYB = "";

    const config = mpesaConfig();

    expect(config.ok).toBe(true);
    if (!config.ok) return;

    expect(config.config.partyB).toBe("123456");
  });

  it("rejects an unsupported transaction type", () => {
    process.env.MPESA_TRANSACTION_TYPE = "CustomerSomethingElse";

    const config = mpesaConfig();

    expect(config.ok).toBe(false);
    if (config.ok) return;

    expect(config.error).toMatch(/MPESA_TRANSACTION_TYPE/);
  });

  it("rejects a non-numeric Party B", () => {
    process.env.MPESA_PARTYB = "till-one";

    const config = mpesaConfig();

    expect(config.ok).toBe(false);
    if (config.ok) return;

    expect(config.error).toMatch(/MPESA_PARTYB/);
  });
});

describe("sendStkPush", () => {
  it("sends a Buy Goods request with the configured Party B", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ResponseCode: "0", CheckoutRequestID: "ws_CO_123" }), {
          status: 200,
        }),
      );

    const result = await sendStkPush("token", {
      shortCode: "123456",
      passkey: "passkey",
      timestamp: "20260115090507",
      amountKes: 1,
      phone: "254712345678",
      callbackUrl: "https://example.com/api/donations/webhook",
      transactionType: "CustomerBuyGoodsOnline",
      partyB: "654321",
    });

    expect(result.checkoutRequestId).toBe("ws_CO_123");

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init?.body));

    expect(body.TransactionType).toBe("CustomerBuyGoodsOnline");
    expect(body.PartyB).toBe(654321);
    expect(body.BusinessShortCode).toBe(123456);
  });
});

describe("queryStkStatus", () => {
  it("reports a successful result as completed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ResultCode: "0", ResultDesc: "The service request is processed successfully." }), {
        status: 200,
      }),
    );

    const result = await queryStkStatus("token", {
      shortCode: "123456",
      passkey: "passkey",
      timestamp: "20260115090507",
      checkoutRequestId: "ws_CO_123",
    });

    expect(result.status).toBe("COMPLETED");
  });
});

describe("mpesaStatusFromResultCode", () => {
  it("maps success and known failures", () => {
    expect(mpesaStatusFromResultCode("0")).toBe("COMPLETED");
    expect(mpesaStatusFromResultCode("1032")).toBe("FAILED");
    expect(mpesaStatusFromResultCode("2001")).toBe("FAILED");
  });

  it("keeps unknown codes pending", () => {
    expect(mpesaStatusFromResultCode("")).toBe("PENDING");
    expect(mpesaStatusFromResultCode("4999")).toBe("PENDING");
  });

  it("explains known codes for logs", () => {
    expect(mpesaResultHint("1032")).toMatch(/Cancelled/i);
  });
});
