import { NextResponse } from "next/server";
import { runTradeGuard } from "../../../agents/orchestrator";
import type { MarketData } from "../../../agents/scannerAgent";

export async function POST(request: Request) {
  try {

     console.log(
    "Gemini key loaded:",
     Boolean(process.env.GEMINI_API_KEY)
        );
    const market: MarketData =
      await request.json();

    if (
      !market.symbol ||
      typeof market.price !== "number" ||
      typeof market.rsi !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid market data.",
        },
        { status: 400 }
      );
    }

    const result =
      await runTradeGuard(market);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error(
      "TradeGuard analysis error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "TradeGuard analysis failed.",
      },
      { status: 500 }
    );
  }
}