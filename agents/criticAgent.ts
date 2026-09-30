import { GoogleGenAI } from "@google/genai";
import type { ScannerResult } from "./scannerAgent";
import type { StrategyResult } from "./strategyAgent";
import type { RiskResult } from "./riskAgent";
import type { SentimentResult } from "./sentimentAgent";

export type CriticResult = {
  agent: "Critic Agent";
  verdict: "PASS" | "REJECT";
  contradictions: string[];
  reasoning: string;
  poweredBy: "Gemini AI" | "Deterministic Fallback";
};

type GeminiCriticResponse = {
  verdict: "PASS" | "REJECT";
  contradictions: string[];
  reasoning: string;
};

function deterministicCritic(
  scanner: ScannerResult,
  strategy: StrategyResult,
  risk: RiskResult,
  sentiment: SentimentResult
): CriticResult {
  const contradictions: string[] = [];

  if (!scanner.opportunity) {
    contradictions.push(
      "Scanner did not confirm a strong opportunity."
    );
  }

  if (strategy.action === "HOLD") {
    contradictions.push(
      "Strategy Agent generated no executable trade."
    );
  }

  if (!risk.approved) {
    contradictions.push(
      "Risk Agent rejected the proposed strategy."
    );
  }

  if (!sentiment.supportive) {
    contradictions.push(
      "Sentiment does not support the proposed trade."
    );
  }

  const verdict: "PASS" | "REJECT" =
    contradictions.length === 0 ? "PASS" : "REJECT";

  return {
    agent: "Critic Agent",
    verdict,
    contradictions,
    reasoning:
      verdict === "PASS"
        ? "Independent validation found no blocking contradictions across the agent outputs."
        : `Critic detected ${contradictions.length} blocking issue(s). Trade should not proceed.`,
    poweredBy: "Deterministic Fallback",
  };
}

// Small delay used before retrying Gemini.
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Detect temporary Gemini/API failures that are worth retrying.
function isRetryableError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  return (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED")
  );
}

export async function criticAgent(
  scanner: ScannerResult,
  strategy: StrategyResult,
  risk: RiskResult,
  sentiment: SentimentResult
): Promise<CriticResult> {
  const fallback = deterministicCritic(
    scanner,
    strategy,
    risk,
    sentiment
  );

  const apiKey = process.env.GEMINI_API_KEY;

  console.log("Gemini key loaded:", Boolean(apiKey));

  if (!apiKey) {
    console.warn(
      "GEMINI_API_KEY missing. Using deterministic critic."
    );

    return fallback;
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const prompt = `
You are the Critic Agent inside TradeGuard AI, a simulated
intraday trading decision-support prototype.

Your task is NOT to create a new trade.

Your job is to independently challenge the outputs produced
by the previous specialized agents.

SCANNER AGENT:
${JSON.stringify(scanner, null, 2)}

STRATEGY AGENT:
${JSON.stringify(strategy, null, 2)}

RISK AGENT:
${JSON.stringify(risk, null, 2)}

SENTIMENT AGENT:
${JSON.stringify(sentiment, null, 2)}

Evaluate whether these outputs are internally consistent.

Important safety rules:

1. If Risk Agent approved=false, verdict MUST be REJECT.
2. If Strategy action is HOLD, verdict MUST be REJECT.
3. If Scanner opportunity=false, verdict MUST be REJECT.
4. If Sentiment supportive=false, treat it as a contradiction.
5. Do not invent market prices, news or external information.
6. Only analyze the information supplied above.
7. This is simulated trading decision support.

Return a concise professional explanation.
`;

  // Gemini will be attempted a maximum of 3 times.
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `Gemini Critic attempt ${attempt}/${maxAttempts}`
      );

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,

        config: {
          responseMimeType: "application/json",

          responseSchema: {
            type: "object",

            properties: {
              verdict: {
                type: "string",
                enum: ["PASS", "REJECT"],
              },

              contradictions: {
                type: "array",
                items: {
                  type: "string",
                },
              },

              reasoning: {
                type: "string",
              },
            },

            required: [
              "verdict",
              "contradictions",
              "reasoning",
            ],
          },
        },
      });

      if (!response.text) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      const parsed = JSON.parse(
        response.text
      ) as GeminiCriticResponse;

      // ------------------------------------------
      // DETERMINISTIC SAFETY OVERRIDE
      // ------------------------------------------
      // Gemini can critique the proposal,
      // but it cannot override hard safety rules.
      const hardFailure =
        !scanner.opportunity ||
        strategy.action === "HOLD" ||
        !risk.approved ||
        !sentiment.supportive;

      const finalVerdict: "PASS" | "REJECT" =
        hardFailure
          ? "REJECT"
          : parsed.verdict === "PASS"
            ? "PASS"
            : "REJECT";

      const contradictions =
        Array.isArray(parsed.contradictions)
          ? parsed.contradictions
          : [];

      if (
        hardFailure &&
        contradictions.length === 0
      ) {
        contradictions.push(
          "Deterministic safety validation detected a blocking condition."
        );
      }

      console.log(
        `Gemini Critic successful on attempt ${attempt}.`
      );

      return {
        agent: "Critic Agent",
        verdict: finalVerdict,
        contradictions,
        reasoning:
          typeof parsed.reasoning === "string"
            ? parsed.reasoning
            : fallback.reasoning,
        poweredBy: "Gemini AI",
      };
    } catch (error) {
      console.error(
        `Gemini Critic attempt ${attempt} failed:`,
        error
      );

      const retryable =
        isRetryableError(error);

      // Stop retrying if:
      // 1. We have used all attempts, OR
      // 2. This is not a temporary API failure.
      if (
        attempt === maxAttempts ||
        !retryable
      ) {
        console.warn(
          "Gemini unavailable. Switching to deterministic fallback."
        );

        return fallback;
      }

      // Increasing delay:
      // Attempt 1 fails -> wait 1 second
      // Attempt 2 fails -> wait 2 seconds
      const delay = attempt * 1000;

      console.log(
        `Temporary Gemini failure. Retrying in ${delay / 1000}s...`
      );

      await sleep(delay);
    }
  }

  // Extra safety return.
  return fallback;
}