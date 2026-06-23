import { AccessToken } from "livekit-server-sdk";

export function generateLiveKitToken(opts: {
  identity: string;
  name: string;
  roomName: string;
}) {
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: opts.identity,
    name: opts.name,
  });

  at.addGrant({ roomJoin: true, room: opts.roomName, canPublish: true, canSubscribe: true });

  return at.toJwt();
}
