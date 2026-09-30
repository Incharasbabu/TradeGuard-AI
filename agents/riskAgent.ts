import type { MarketData } from "./scannerAgent";
import type { StrategyResult } from "./strategyAgent";

export type RiskResult = {
  agent: "Risk Agent";
  riskScore: number;
  riskReward: number;
  exposure: "Low" | "Moderate" | "High";
  approved: boolean;
  reasoning: string;
};

export function riskAgent(
  market: MarketData,
  strategy: StrategyResult
): RiskResult {
  if (strategy.action === "HOLD") {
    return {
      agent: "Risk Agent",
      riskScore: 70,
      riskReward: 0,
      exposure: "High",
      approved: false,
      reasoning:
        "No valid trade setup exists, therefore risk validation failed.",
    };
  }

  const reward = Math.abs(strategy.target - strategy.entry);
  const risk = Math.abs(strategy.entry - strategy.stopLoss);

  const riskReward =
    risk === 0
      ? 0
      : Number((reward / risk).toFixed(2));

  let riskScore = 30;

  if (market.volatility === "Moderate") {
    riskScore += 10;
  }

  if (market.volatility === "High") {
    riskScore += 35;
  }

  if (riskReward < 1.5) {
    riskScore += 25;
  }

  riskScore = Math.min(riskScore, 100);

  const exposure =
    riskScore >= 70
      ? "High"
      : riskScore >= 45
      ? "Moderate"
      : "Low";

  const approved =
    riskScore < 70 && riskReward >= 1.5;

  return {
    agent: "Risk Agent",
    riskScore,
    riskReward,
    exposure,
    approved,
    reasoning: approved
      ? `Risk score ${riskScore}/100 with reward-to-risk ${riskReward}:1. Trade remains within safety limits.`
      : `Risk score ${riskScore}/100 with reward-to-risk ${riskReward}:1. Risk conditions exceed acceptable limits.`,
  };
}