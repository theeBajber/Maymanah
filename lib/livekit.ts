import { AccessToken } from "livekit-server-sdk";

export async function generateLiveKitToken(opts: {
  identity: string;
  name: string;
  roomName: string;
}) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "LiveKit is not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in your .env.local file. " +
        "Sign up at https://livekit.io/cloud to get your credentials.",
    );
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: opts.identity,
    name: opts.name,
  });

  at.addGrant({ roomJoin: true, room: opts.roomName, canPublish: true, canSubscribe: true, canPublishData: true });

  return await at.toJwt();
}
