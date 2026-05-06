"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";

import DirectionLabel from "@/components/DirectionLabel";
import type { Direction } from "@/lib/prompts";

type TranslateResponse = { result: string } | { error: string };

const AUTO_TRANSLATE_DELAY_MS = 900;

export default function Translator() {
  const [direction, setDirection] = useState<Direction>("F2T");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const isF2T = direction === "F2T";
  const fromLabel = isF2T ? "F" : "T";
  const toLabel = isF2T ? "T" : "F";
  const fromCaption = isF2T ? "감정·맥락의 언어" : "사실·논리의 언어";
  const toCaption = isF2T ? "사실·논리의 언어" : "감정·맥락의 언어";

  const swap = () => {
    setDirection(isF2T ? "T2F" : "F2T");
    setInput(output);
    setOutput("");
    setError("");
  };

  const translate = useCallback(async (text: string, selectedDirection: Direction) => {
    setError("");
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    setLoading(true);
    setOutput("");

    const payload = {
      direction: selectedDirection,
      text: trimmedText
    };

    let response: Response;

    try {
      response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch {
      if (controller.signal.aborted) {
        return;
      }

      setError("네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.");
      setLoading(false);
      return;
    }

    let data: unknown;

    try {
      data = await response.json();
    } catch {
      if (controller.signal.aborted) {
        return;
      }

      setError("서버 응답을 해석하지 못했습니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
      return;
    }

    if (controller.signal.aborted || requestIdRef.current !== requestId) {
      return;
    }

    if (!isTranslateResponse(data)) {
      setError("서버 응답 형식이 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    if (!response.ok) {
      setError("error" in data ? data.error : `요청 실패 (${response.status})`);
      setLoading(false);
      return;
    }

    if ("error" in data) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setOutput(data.result);
    setLoading(false);
    if (activeRequestRef.current === controller) {
      activeRequestRef.current = null;
    }
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    activeRequestRef.current?.abort();
    setLoading(false);
    setError("");

    if (!input.trim()) {
      setOutput("");
      return;
    }

    setOutput("");
    const timer = window.setTimeout(() => {
      void translate(input, direction);
    }, AUTO_TRANSLATE_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [direction, input, translate]);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#f5f1e8] text-[#1a1a1a] font-serif">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="double-rule mb-4" />
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-5xl md:text-6xl mt-1 font-semibold italic">
                The F↔T Translator
              </h1>
              <p className="mono text-xs uppercase tracking-[0.2em] text-stone-600 mt-2">
                Decoding what the other side actually meant — since today.
              </p>
            </div>
          </div>
          <div className="rule mt-4" />
        </header>

        <div className="flex items-center justify-center gap-6 mb-6">
          <DirectionLabel
            letter={fromLabel}
            caption={fromCaption}
            active
            align="right"
          />
          <button
            type="button"
            onClick={swap}
            className="border border-stone-900 p-3 hover:bg-stone-900 hover:text-stone-100 transition btn-press"
            title="방향 전환 (입력↔출력 스왑)"
          >
            <ArrowLeftRight size={18} />
          </button>
          <DirectionLabel
            letter={toLabel}
            caption={toCaption}
            active={false}
            align="left"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-0 border border-stone-900">
          <div className="border-b md:border-b-0 md:border-r border-stone-900 grain">
            <div className="px-4 py-2.5 border-b border-stone-900 flex items-center justify-between bg-stone-50">
              <span className="mono text-[10px] uppercase tracking-[0.3em]">
                Original · {fromLabel}
              </span>
              <span className="mono text-[10px] text-stone-500">
                {input.length} chars
              </span>
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                isF2T
                  ? "예) 아니 그게 좀… 굳이 그렇게까지 해야 되나 싶어서. 네가 하고 싶으면 해도 되긴 한데."
                  : "예) 그 방식은 비효율적이야. 데이터 기반으로 다시 짜는 게 맞아."
              }
              className="w-full px-5 py-5 bg-transparent text-lg leading-relaxed resize-none min-h-[280px]"
            />
          </div>

          <div>
            <div className="px-4 py-2.5 border-b border-stone-900 flex items-center justify-between bg-stone-900 text-stone-100">
              <span className="mono text-[10px] uppercase tracking-[0.3em]">
                Translated · {toLabel}
              </span>
              {loading && <Loader2 size={12} className="animate-spin" />}
            </div>
            <div className="px-5 py-5 text-lg leading-relaxed whitespace-pre-wrap min-h-[280px]">
              {output ? (
                <span>{output}</span>
              ) : (
                <span className="text-stone-400 italic">
                  {loading ? "번역 중…" : "번역 결과가 여기에 나타납니다."}
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 border border-red-900 bg-red-50 px-4 py-3 mono text-xs text-red-900">
            ! {error}
          </div>
        )}

        <footer className="mt-12">
          <div className="rule mb-3" />
          <div className="mono text-[10px] uppercase tracking-[0.3em] text-stone-500 flex justify-between flex-wrap gap-2">
            <span>Translation is interpretation. — Edith Grossman</span>
            <span>powered by openai</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function isTranslateResponse(value: unknown): value is TranslateResponse {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.result === "string" || typeof value.error === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
