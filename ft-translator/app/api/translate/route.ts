import { NextRequest, NextResponse } from "next/server";

import { buildSystemPrompt, type Direction } from "@/lib/prompts";

export type TranslateRequest = {
  direction: "F2T" | "T2F";
  text: string;
};

export type TranslateResponse = { result: string } | { error: string };

export const dynamic = "force-dynamic";

const OPENAI_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini";
const MAX_TEXT_LENGTH = 1200;

export async function POST(
  request: NextRequest
): Promise<NextResponse<TranslateResponse>> {
  const body = await readJson(request);

  if (!body.ok) {
    return NextResponse.json(
      { error: "요청 JSON을 해석할 수 없습니다." },
      { status: 400 }
    );
  }

  const parsed = parseTranslateRequest(body.value);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const serverApiKey = process.env.OPENAI_API_KEY?.trim();

  if (!serverApiKey) {
    return NextResponse.json(
      {
        error:
          "서버에 OPENAI_API_KEY가 설정되어 있지 않습니다. .env.local 또는 Vercel 환경 변수에 키를 설정해주세요."
      },
      { status: 400 }
    );
  }

  try {
    const openAiResponse = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serverApiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(parsed.value.direction)
          },
          { role: "user", content: parsed.value.text }
        ]
      })
    });

    const data = await readResponseJson(openAiResponse);

    if (!openAiResponse.ok) {
      const errorMessage =
        extractOpenAiErrorMessage(data) ||
        `OpenAI 요청 실패 (${openAiResponse.status})`;

      return NextResponse.json(
        { error: redactApiKey(errorMessage, serverApiKey) },
        { status: openAiResponse.status }
      );
    }

    const result = extractAssistantMessage(data);

    if (!result) {
      return NextResponse.json(
        { error: "OpenAI 응답에서 번역 결과를 찾을 수 없습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { error: "OpenAI 서버에 연결하지 못했습니다. 네트워크 상태를 확인해주세요." },
      { status: 502 }
    );
  }
}

async function readJson(
  request: NextRequest
): Promise<{ ok: true; value: unknown } | { ok: false }> {
  try {
    return { ok: true, value: await request.json() };
  } catch {
    return { ok: false };
  }
}

async function readResponseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function parseTranslateRequest(
  value: unknown
): { ok: true; value: TranslateRequest } | { ok: false; error: string } {
  if (!isRecord(value)) {
    return { ok: false, error: "요청 본문 형식이 올바르지 않습니다." };
  }

  const { direction, text } = value;

  if (!isDirection(direction)) {
    return { ok: false, error: "번역 방향이 올바르지 않습니다." };
  }

  if (typeof text !== "string" || !text.trim()) {
    return { ok: false, error: "번역할 문장을 입력해주세요." };
  }

  const trimmedText = text.trim();

  if (trimmedText.length > MAX_TEXT_LENGTH) {
    return {
      ok: false,
      error: `번역할 문장은 ${MAX_TEXT_LENGTH}자 이하로 입력해주세요.`
    };
  }

  return {
    ok: true,
    value: {
      direction,
      text: trimmedText
    }
  };
}

function isDirection(value: unknown): value is Direction {
  return value === "F2T" || value === "T2F";
}

function extractOpenAiErrorMessage(value: unknown): string | null {
  if (!isRecord(value) || !isRecord(value.error)) {
    return null;
  }

  return typeof value.error.message === "string" ? value.error.message : null;
}

function extractAssistantMessage(value: unknown): string | null {
  if (!isRecord(value) || !Array.isArray(value.choices)) {
    return null;
  }

  const [choice] = value.choices;

  if (!isRecord(choice) || !isRecord(choice.message)) {
    return null;
  }

  const { content } = choice.message;

  return typeof content === "string" ? content.trim() : null;
}

function redactApiKey(message: string, apiKey: string): string {
  return message
    .replaceAll(apiKey, "[REDACTED_API_KEY]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-***");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
