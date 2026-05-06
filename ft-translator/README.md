# NUTTIE: F↔T Translator

"너, T야?" 한국어 문장을 MBTI F→T 또는 T→F 표현으로 의도를 변환하는 Next.js App Router 앱

## 로컬 실행

```bash
pnpm i
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 환경 변수 설정

프로젝트 루트에 `.env.local`을 만들고 다음 값을 설정합니다.

```bash
OPENAI_API_KEY=your_openai_api_key
```

`/api/translate` 서버 라우트가 이 키로 OpenAI를 호출합니다. 키 값 자체는 클라이언트로 전송되지 않으며, 사용자가 브라우저에서 API 키를 입력하는 UI도 없습니다.

서버 키가 없으면 번역 요청은 400 에러를 반환합니다.

## 주요 명령어

```bash
corepack enable
pnpm install
pnpm typecheck
pnpm build
pnpm start
```

## 보안 메모

- 클라이언트 코드에서 서버 API 키를 직접 참조하지 않습니다.
- `NEXT_PUBLIC_` 환경 변수에 API 키를 넣지 않습니다.
- OpenAI 모델은 서버 라우트에서 고정합니다.
- 번역 입력은 서버에서 최대 1200자로 제한합니다.
- OpenAI 응답은 `{ result: string }` 형태로만 클라이언트에 전달합니다.
- 에러 메시지는 API 키가 포함되지 않도록 서버에서 한 번 더 마스킹합니다.
