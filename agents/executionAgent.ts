import type { StrategyResult } from "./strategyAgent";
import type { RiskResult } from "./riskAgent";
import type { SentimentResult } from "./sentimentAgent";
import type { CriticResult } from "./criticAgent";

export type ExecutionResult = {
  agent: "Execution Guard";
  decision: "APPROVED" | "BLOCKED";
  execute: boolean;

  executionType: "SIMULATED";
  executionStatus: "EXECUTED" | "NOT_EXECUTED";

  action: "BUY" | "SELL" | "HOLD";
  entry: number;
  target: number;
  stopLoss: number;

  reason: string;
};

export function executionAgent(
  strategy: StrategyResult,
  risk: RiskResult,
  sentiment: SentimentResult,
  critic: CriticResult
): ExecutionResult {
  // Hard deterministic safety conditions
  const safe =
    strategy.action !== "HOLD" &&
    risk.approved &&
    sentiment.supportive &&
    critic.verdict === "PASS";

  if (safe) {
    return {
      agent: "Execution Guard",

      decision: "APPROVED",
      execute: true,

      executionType: "SIMULATED",
      executionStatus: "EXECUTED",

      action: strategy.action,
      entry: strategy.entry,
      target: strategy.target,
      stopLoss: strategy.stopLoss,

      reason:
        "All safety conditions passed. Simulated paper trade executed successfully.",
    };
  }

  return {
    agent: "Execution Guard",

    decision: "BLOCKED",
    execute: false,

    executionType: "SIMULATED",
    executionStatus: "NOT_EXECUTED",

    action: strategy.action,
    entry: strategy.entry,
    target: strategy.target,
    stopLoss: strategy.stopLoss,

    reason:
      "One or more safety conditions failed. TradeGuard prevented simulated execution.",
  };
}