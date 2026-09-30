import {
  scannerAgent,
  type MarketData,
} from "./scannerAgent";

import { strategyAgent } from "./strategyAgent";
import { riskAgent } from "./riskAgent";
import { sentimentAgent } from "./sentimentAgent";
import { criticAgent } from "./criticAgent";
import { executionAgent } from "./executionAgent";

export async function runTradeGuard(
  market: MarketData
) {
  // Agent 1
  const scanner = scannerAgent(market);

  // Agent 2
  const strategy = strategyAgent(
    market,
    scanner
  );

  // Agent 3
  const risk = riskAgent(
    market,
    strategy
  );

  // Agent 4
  const sentiment = sentimentAgent(
    market
  );

  // Agent 5 - Gemini-powered AI Critic
  const critic = await criticAgent(
    scanner,
    strategy,
    risk,
    sentiment
  );

  // Agent 6 - deterministic safety gate
  const execution = executionAgent(
    strategy,
    risk,
    sentiment,
    critic
  );

  return {
    market,
    scanner,
    strategy,
    risk,
    sentiment,
    critic,
    execution,

    system: {
      architecture: "Hybrid Agentic AI",
      llmIntegrated:
        critic.poweredBy === "Gemini AI",
      llmAgent: critic.poweredBy,
      safetyGuard:
        "Deterministic Execution Guard",
    },
  };
}