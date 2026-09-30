import type {
  MarketData,
  ScannerResult,
} from "./scannerAgent";

export type StrategyResult = {
  agent: "Strategy Agent";
  action: "BUY" | "SELL" | "HOLD";
  entry: number;
  target: number;
  stopLoss: number;
  reasoning: string;
};

export function strategyAgent(
  market: MarketData,
  scanner: ScannerResult
): StrategyResult {
  const entry = market.price;

  if (scanner.signal === "BUY") {
    const target = Number((entry * 1.022).toFixed(2));
    const stopLoss = Number((entry * 0.989).toFixed(2));

    return {
      agent: "Strategy Agent",
      action: "BUY",
      entry,
      target,
      stopLoss,
      reasoning: `BUY strategy generated at ₹${entry} with target ₹${target} and stop-loss ₹${stopLoss}.`,
    };
  }

  if (scanner.signal === "SELL") {
    const target = Number((entry * 0.978).toFixed(2));
    const stopLoss = Number((entry * 1.011).toFixed(2));

    return {
      agent: "Strategy Agent",
      action: "SELL",
      entry,
      target,
      stopLoss,
      reasoning: `SELL strategy generated at ₹${entry} with target ₹${target} and stop-loss ₹${stopLoss}.`,
    };
  }

  return {
    agent: "Strategy Agent",
    action: "HOLD",
    entry,
    target: entry,
    stopLoss: entry,
    reasoning:
      "Scanner did not identify a sufficiently strong opportunity. No active trade strategy generated.",
  };
}