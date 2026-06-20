import { createServerFn } from "@tanstack/react-start";

export const getElevenLabsToken = createServerFn({ method: "POST" })
  .inputValidator((input: { agentId: string }) => {
    if (!input?.agentId || typeof input.agentId !== "string") {
      throw new Error("agentId is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ElevenLabs is not connected to this project");
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(data.agentId)}`,
      { headers: { "xi-api-key": apiKey } },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Failed to fetch ElevenLabs token (${res.status}): ${body}`);
    }

    const json = (await res.json()) as { token: string };
    return { token: json.token };
  });
