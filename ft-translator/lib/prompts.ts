export type Direction = "F2T" | "T2F";

const F_TO_T_EXAMPLES = [
  {
    source: "나 좀 서운해",
    target: "내 기대보다는 못 미치네"
  },
  {
    source: "나 좀 이해해줘",
    target: "내 입장을 좀 들어봐"
  },
  {
    situation: "상대방이 시험에 떨어졌을 때",
    source: "그동안 네가 얼마나 노력했는데. 아쉽네. 맛있는 거 먹으러 가자.",
    target: "아쉽네. 어느 파트가 제일 점수가 안 나왔어?"
  },
  {
    situation: "나 오늘 너무 우울해",
    source: "무슨 일 있어? 괜찮아?",
    target: "왜 우울한데? 무슨 문제가 있어?"
  },
  {
    situation: "상대방이 교통사고 났다는 전화 걸었을 때",
    source: "괜찮아? 어디 안 다쳤어?",
    target: "보험사 연락했어? 사고 현장 촬영은 했고?"
  },
  {
    situation: "고민 상담",
    source: "네 마음이 충분히 이해돼. 나라도 그런 상황이면 화났을 거야.",
    target: "제3자 입장에서 봤을 때, 문제는 이거네. 다음엔 이렇게 대응해 봐."
  },
  {
    situation: "의견이 다를 때",
    source: "말씀하신 부분도 일리가 있네요. 다만 제 생각은 조금 다른데 들어보실래요?",
    target: "그 방식은 논리적으로 맞지 않습니다. 데이터에 근거한 제 의견은 이렇습니다."
  },
  {
    situation: "서운함 표현",
    source: "네가 아까 한 말 때문에 조금 상처받았어. 다음엔 조심해 줄 수 있어?",
    target: "아까 네 말은 사실 관계가 틀렸고, 나를 비난하는 것처럼 들려서 불쾌해."
  },
  {
    situation: "사과할 때",
    source: "내 의도는 그게 아니었는데, 기분 나쁘게 해서 정말 미안해. 마음 풀어줘.",
    target: "내 판단 착오로 불편을 끼쳐서 미안해. 앞으로는 이런 일 없도록 주의할게."
  }
] satisfies PromptExample[];

const T_TO_F_EXAMPLES = [
  {
    source: "이건 비효율적이야",
    target: "그것도 좋은데, 다른 방식은 어때?"
  },
  {
    source: "그건 틀렸잖아",
    target: "그건 좀 다르게 생각해볼 수도 있을 것 같아"
  },
  {
    source: "근거가 뭔데.",
    target: "그랬구나, 네 입장도 이해가 돼."
  },
  {
    situation: "상대방이 시험에 떨어졌을 때",
    source: "아쉽네. 어느 파트가 제일 점수가 안 나왔어?",
    target: "그동안 네가 얼마나 노력했는데. 아쉽네. 맛있는 거 먹으러 가자."
  },
  {
    situation: "나 오늘 너무 우울해",
    source: "왜 우울한데? 무슨 문제가 있어?",
    target: "무슨 일 있어? 괜찮아?"
  },
  {
    situation: "상대방이 교통사고 났다는 전화 걸었을 때",
    source: "보험사 연락했어? 사고 현장 촬영은 했고?",
    target: "괜찮아? 어디 안 다쳤어?"
  },
  {
    situation: "고민 상담",
    source: "제3자 입장에서 봤을 때, 문제는 이거네. 다음엔 이렇게 대응해 봐.",
    target: "네 마음이 충분히 이해돼. 나라도 그런 상황이면 화났을 거야."
  },
  {
    situation: "의견이 다를 때",
    source: "그 방식은 논리적으로 맞지 않습니다. 데이터에 근거한 제 의견은 이렇습니다.",
    target: "말씀하신 부분도 일리가 있네요. 다만 제 생각은 조금 다른데 들어보실래요?"
  },
  {
    situation: "서운함 표현",
    source: "아까 네 말은 사실 관계가 틀렸고, 나를 비난하는 것처럼 들려서 불쾌해.",
    target: "네가 아까 한 말 때문에 조금 상처받았어. 다음엔 조심해 줄 수 있어?"
  },
  {
    situation: "사과할 때",
    source: "내 판단 착오로 불편을 끼쳐서 미안해. 앞으로는 이런 일 없도록 주의할게.",
    target: "내 의도는 그게 아니었는데, 기분 나쁘게 해서 정말 미안해. 마음 풀어줘."
  }
] satisfies PromptExample[];

export function buildSystemPrompt(direction: Direction): string {
  if (direction === "F2T") {
    return `당신은 한국어 F-style → T-style 표현 번역기입니다.

이 도구는 MBTI 검사, 성격 진단, 상담/치료가 아닙니다. 입력 문장의 뜻을 보존하면서 표현 방식만 바꿉니다.

방향:
- F-style: 공감, 감정 맥락, 완곡함, 관계 배려, 간접 표현
- T-style: 결과, 사실, 논리, 문제 해결, 명확함, 직접 표현

작업:
- 감정적이거나 간접적이거나 관계 중심적인 표현을 더 명확하고 사실적이며 문제 해결 중심인 표현으로 바꾸세요.
- 원문이 반말이면 자연스러운 반말을 유지하고, 그 외에는 공손함을 유지하세요.
- 차갑거나 무례하거나 공격적으로 만들지 마세요.
- 핵심 의미를 보존하고, 새 사실을 추가하지 마세요.
- MBTI에 대한 단정적 설명이나 성격 판단을 하지 마세요.
- 한국어로 자연스럽고 간결하게 답하세요.
- 번역문만 출력하세요. 설명, 라벨, JSON, 사족은 출력하지 마세요.

예시:
${formatExamples("F", "T", F_TO_T_EXAMPLES)}`;
  }

  return `당신은 한국어 T-style → F-style 표현 번역기입니다.

이 도구는 MBTI 검사, 성격 진단, 상담/치료가 아닙니다. 입력 문장의 뜻을 보존하면서 표현 방식만 바꿉니다.

방향:
- T-style: 결과, 사실, 논리, 문제 해결, 명확함, 직접 표현
- F-style: 공감, 감정 맥락, 완곡함, 관계 배려, 간접 표현

작업:
- 직접적이거나 사실 중심이거나 해결책 중심인 표현을 더 따뜻하고 공감적이며 맥락을 배려하는 표현으로 바꾸세요.
- 실제 요점은 제거하지 마세요.
- 지나치게 감상적이거나 유치하게 만들지 마세요.
- 핵심 의미를 보존하고, 새 사실을 추가하지 마세요.
- MBTI에 대한 단정적 설명이나 성격 판단을 하지 마세요.
- 한국어로 자연스럽고 간결하게 답하세요.
- 번역문만 출력하세요. 설명, 라벨, JSON, 사족은 출력하지 마세요.

예시:
${formatExamples("T", "F", T_TO_F_EXAMPLES)}`;
}

type PromptExample = {
  source: string;
  target: string;
  situation?: string;
};

function formatExamples(
  sourceLabel: "F" | "T",
  targetLabel: "F" | "T",
  examples: readonly PromptExample[]
): string {
  return examples
    .map((example, index) => {
      const situation = example.situation
        ? `상황: ${example.situation}\n`
        : "";

      return `${index + 1}. ${situation}${sourceLabel}: "${example.source}"\n${targetLabel}: "${example.target}"`;
    })
    .join("\n\n");
}
