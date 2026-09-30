export type MarketData = {
  symbol: string;
  price: number;
  rsi: number;
  volatility: "Low" | "Moderate" | "High";
  trend: "Bullish" | "Bearish" | "Neutral";
};

export type ScannerResult = {
  agent: "Scanner Agent";
  opportunity: boolean;
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reasoning: string;
};

export function scannerAgent(data: MarketData): ScannerResult {
  let signal: "BUY" | "SELL" | "HOLD" = "HOLD";
  let confidence = 50;
  let opportunity = false;
  let reasoning = "";

  if (data.rsi <= 35 && data.trend === "Bullish") {
    signal = "BUY";
    confidence = 82;
    opportunity = true;

    reasoning =
      "RSI is near the oversold region while price momentum is recovering. Scanner detected a potential BUY opportunity.";
  } else if (data.rsi >= 65) {
    signal = "HOLD";
    confidence = 76;
    opportunity = false;

    reasoning =
      "RSI is elevated and price has already moved sharply. Scanner detected a potentially overheated market.";
  } else if (data.trend === "Bearish") {
    signal = "SELL";
    confidence = 70;
    opportunity = true;

    reasoning =
      "Bearish price momentum has been detected. Scanner identified a potential downside setup.";
  } else {
    reasoning =
      "Market conditions do not currently provide a sufficiently strong trading opportunity.";
  }

  return {
    agent: "Scanner Agent",
    opportunity,
    signal,
    confidence,
    reasoning,
  };
}