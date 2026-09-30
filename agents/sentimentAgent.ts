import type { MarketData } from "./scannerAgent";

export type SentimentResult = {
  agent: "Sentiment Agent";
  sentiment: "Bullish" | "Bearish" | "Cautious" | "Neutral";
  score: number;
  supportive: boolean;
  reasoning: string;
};

export function sentimentAgent(
  market: MarketData
): SentimentResult {
  if (
    market.trend === "Bullish" &&
    market.rsi < 60
  ) {
    return {
      agent: "Sentiment Agent",
      sentiment: "Bullish",
      score: 78,
      supportive: true,
      reasoning:
        "Price momentum is positive without extreme RSI conditions. Market sentiment supports the proposed setup.",
    };
  }

  if (market.rsi >= 65) {
    return {
      agent: "Sentiment Agent",
      sentiment: "Cautious",
      score: 38,
      supportive: false,
      reasoning:
        "Short-term momentum is strong but elevated RSI increases reversal risk. Sentiment validation is cautious.",
    };
  }

  if (market.trend === "Bearish") {
    return {
      agent: "Sentiment Agent",
      sentiment: "Bearish",
      score: 65,
      supportive: true,
      reasoning:
        "Market momentum is bearish and supports a downside strategy.",
    };
  }

  return {
    agent: "Sentiment Agent",
    sentiment: "Neutral",
    score: 50,
    supportive: false,
    reasoning:
      "Market sentiment is mixed and does not strongly support the proposed setup.",
  };
}