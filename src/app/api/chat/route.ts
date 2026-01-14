const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  systemPrompt: string;
  messages: IncomingMessage[];
  playerProfile?: unknown;
};

export async function POST(request: Request) {
  const { systemPrompt, messages, playerProfile } =
    (await request.json()) as ChatRequest;

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return new Response("Missing AI_API_KEY.", { status: 500 });
  }

  const baseUrl = process.env.AI_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  const systemContent = playerProfile
    ? `${systemPrompt}\n\n[PLAYER_PROFILE]\n${JSON.stringify(
        playerProfile,
      )}\n[/PLAYER_PROFILE]`
    : systemPrompt;

  const payload = {
    model,
    stream: true,
    messages: [
      { role: "system", content: systemContent },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ],
  };

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    return new Response(errorText || "AI request failed.", {
      status: response.status || 500,
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) {
              continue;
            }
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // Ignore malformed chunks.
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
