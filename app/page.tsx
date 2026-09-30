"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const healthyData = [
  { time: "09:15", price: 520 },
  { time: "09:30", price: 523 },
  { time: "09:45", price: 521 },
  { time: "10:00", price: 525 },
  { time: "10:15", price: 528 },
  { time: "10:30", price: 526 },
  { time: "10:45", price: 531 },
  { time: "11:00", price: 534 },
  { time: "11:15", price: 536 },
  { time: "11:30", price: 540 },
  { time: "11:45", price: 544 },
  { time: "12:00", price: 548 },
];

const riskyData = [
  { time: "09:15", price: 560 },
  { time: "09:30", price: 565 },
  { time: "09:45", price: 570 },
  { time: "10:00", price: 568 },
  { time: "10:15", price: 575 },
  { time: "10:30", price: 582 },
  { time: "10:45", price: 578 },
  { time: "11:00", price: 590 },
  { time: "11:15", price: 585 },
  { time: "11:30", price: 598 },
  { time: "11:45", price: 592 },
  { time: "12:00", price: 605 },
];

const agentInfo = [
  {
    number: "01",
    name: "Scanner Agent",
    description: "Detects potential intraday market opportunities.",
  },
  {
    number: "02",
    name: "Strategy Agent",
    description: "Generates entry, target and stop-loss levels.",
  },
  {
    number: "03",
    name: "Risk Agent",
    description: "Evaluates volatility, exposure and reward-to-risk.",
  },
  {
    number: "04",
    name: "Sentiment Agent",
    description: "Evaluates broader market sentiment and momentum.",
  },
  {
    number: "05",
    name: "Gemini AI Critic",
    description:
      "Uses Gemini to challenge conclusions and explain contradictions.",
  },
  {
    number: "06",
    name: "Execution Guard",
    description:
      "Applies deterministic safety rules before simulated execution.",
  },
];

type AuditRecord = {
  id: number;
  time: string;
  symbol: string;
  action: string;
  critic: string;
  poweredBy: string;
  decision: string;
  riskScore: number;
};

export default function Home() {
  const [scenario, setScenario] =
    useState<"healthy" | "risky">("healthy");

  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeAgent, setActiveAgent] = useState(0);
  const [error, setError] = useState("");
  const [auditHistory, setAuditHistory] = useState<AuditRecord[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(
      "tradeguard-audit-history"
    );

    if (savedHistory) {
      try {
        setAuditHistory(JSON.parse(savedHistory));
      } catch {
        setAuditHistory([]);
      }
    }
  }, []);

  const isHealthy = scenario === "healthy";
  const chartData = isHealthy ? healthyData : riskyData;

  const backendAgents = analysisResult
    ? [
        analysisResult.scanner,
        analysisResult.strategy,
        analysisResult.risk,
        analysisResult.sentiment,
        analysisResult.critic,
        analysisResult.execution,
      ]
    : [];

  const runAnalysis = async () => {
    setLoading(true);
    setAnalyzed(false);
    setAnalysisResult(null);
    setActiveAgent(1);
    setError("");

    try {
      const marketData = isHealthy
        ? {
            symbol: "ABC Industries",
            price: 536,
            rsi: 32,
            volatility: "Moderate",
            trend: "Bullish",
          }
        : {
            symbol: "ABC Industries",
            price: 600,
            rsi: 72,
            volatility: "High",
            trend: "Bullish",
          };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(marketData),
      });

      if (!response.ok) {
        throw new Error("Analysis request failed");
      }

      const data = await response.json();

      setAnalysisResult(data);

      const auditRecord: AuditRecord = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        symbol: data.market.symbol,
        action: data.strategy.action,
        critic: data.critic.verdict,
        poweredBy:
          data.critic.poweredBy ?? "Deterministic Fallback",
        decision: data.execution.decision,
        riskScore: data.risk.riskScore,
      };

      setAuditHistory((previous) => {
        const updated = [
          auditRecord,
          ...previous,
        ].slice(0, 8);

        localStorage.setItem(
          "tradeguard-audit-history",
          JSON.stringify(updated)
        );

        return updated;
      });

      // Visualize six-agent workflow.
      for (let i = 1; i <= 6; i++) {
        setActiveAgent(i);

        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        );
      }

      setActiveAgent(7);
      setLoading(false);
      setAnalyzed(true);
    } catch (err) {
      console.error("TradeGuard Error:", err);

      setError(
        "Analysis failed. Please check the API connection and try again."
      );

      setLoading(false);
      setActiveAgent(0);
    }
  };

  const changeScenario = (
    type: "healthy" | "risky"
  ) => {
    setScenario(type);
    setAnalyzed(false);
    setLoading(false);
    setAnalysisResult(null);
    setActiveAgent(0);
    setError("");
  };

  const getAgentReasoning = (
    agentNumber: string
  ) => {
    const number = Number(agentNumber);
    const index = number - 1;

    if (loading && number === activeAgent) {
      return "Analyzing market conditions...";
    }

    if (
      backendAgents.length > 0 &&
      number < activeAgent
    ) {
      const result = backendAgents[index];

      if (!result) {
        return "Agent analysis completed.";
      }

      return (
        result.reasoning ??
        result.reason ??
        "Agent analysis completed."
      );
    }

    return "Waiting for analysis...";
  };

  const getAgentStatus = (
    agentNumber: string
  ) => {
    const number = Number(agentNumber);

    if (loading && number === activeAgent) {
      return "ANALYZING";
    }

    if (number < activeAgent) {
      return "COMPLETE";
    }

    return "WAITING";
  };

  const getStatusClasses = (
    agentNumber: string
  ) => {
    const status = getAgentStatus(agentNumber);

    if (status === "ANALYZING") {
      return "bg-yellow-950 text-yellow-400";
    }

    if (status === "COMPLETE") {
      return "bg-green-950 text-green-400";
    }

    return "bg-slate-800 text-slate-400";
  };

  const decision =
    analysisResult?.execution?.decision;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-blue-800 bg-blue-950 px-4 py-2 text-xs font-semibold text-blue-300">
              AGENTIC AI • INTRADAY DECISION INTELLIGENCE
            </span>

            <span className="rounded-full border border-purple-800 bg-purple-950/50 px-4 py-2 text-xs font-semibold text-purple-300">
              ✦ GEMINI INTEGRATED
            </span>

            <span className="rounded-full border border-emerald-900 bg-emerald-950/40 px-4 py-2 text-xs font-semibold text-emerald-400">
              DETERMINISTIC SAFETY
            </span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight">
            TradeGuard AI
          </h1>

          <p className="mt-3 text-lg text-blue-300">
            Analyze. Validate. Protect. Execute.
          </p>

          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Hybrid multi-agent decision-support system combining
            specialized trading agents, Gemini-powered critique and
            deterministic safety controls for simulated intraday
            trading.
          </p>
        </header>

        {/* SCENARIO */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Demo Scenario
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Switch between market conditions to demonstrate how
            TradeGuard approves or blocks a proposed trade.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() =>
                changeScenario("healthy")
              }
              disabled={loading}
              className={`rounded-lg px-5 py-3 font-semibold ${
                isHealthy
                  ? "bg-green-700"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              🟢 Healthy Setup
            </button>

            <button
              onClick={() =>
                changeScenario("risky")
              }
              disabled={loading}
              className={`rounded-lg px-5 py-3 font-semibold ${
                !isHealthy
                  ? "bg-red-700"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              🔴 Risky Setup
            </button>
          </div>
        </section>

        {/* MARKET METRICS */}
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <Metric
            title="STOCK"
            value="ABC Industries"
          />

          <Metric
            title="CURRENT PRICE"
            value={
              isHealthy ? "₹548" : "₹605"
            }
          />

          <Metric
            title="RSI"
            value={isHealthy ? "32" : "72"}
          />

          <Metric
            title="VOLATILITY"
            value={
              isHealthy ? "Moderate" : "High"
            }
          />
        </section>

        {/* CHART */}
        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-7">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Market Price
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Simulated intraday market feed
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                />

                <YAxis
                  stroke="#64748b"
                  domain={["auto", "auto"]}
                />

                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border:
                      "1px solid #334155",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={
                    isHealthy
                      ? "#3b82f6"
                      : "#ef4444"
                  }
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* AGENT PIPELINE */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold">
            Agent Pipeline
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Market Data → Scanner → Strategy → Risk →
            Sentiment → Gemini Critic → Execution Guard
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agentInfo.map((agent) => (
              <div
                key={agent.number}
                className={`rounded-2xl border bg-slate-900 p-6 transition-all duration-300 ${
                  loading &&
                  Number(agent.number) ===
                    activeAgent
                    ? "border-yellow-500"
                    : Number(agent.number) <
                        activeAgent
                      ? Number(
                            agent.number
                          ) === 5
                        ? "border-purple-800"
                        : "border-green-900"
                      : "border-slate-800"
                }`}
              >
                <div
                  className={
                    agent.number === "05"
                      ? "text-sm font-bold text-purple-400"
                      : "text-sm font-bold text-sky-400"
                  }
                >
                  AGENT {agent.number}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold">
                    {agent.name}
                  </h3>

                  {agent.number === "05" && (
                    <span className="rounded-full border border-purple-700 bg-purple-950 px-2 py-1 text-[10px] font-bold text-purple-300">
                      LLM POWERED
                    </span>
                  )}

                  {agent.number === "06" && (
                    <span className="rounded-full border border-emerald-800 bg-emerald-950 px-2 py-1 text-[10px] font-bold text-emerald-400">
                      SAFETY GATE
                    </span>
                  )}
                </div>

                <p className="mt-2 min-h-[42px] text-sm text-slate-400">
                  {agent.description}
                </p>

                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="mb-2 text-sm font-semibold text-blue-400">
                    🧠 Agent Reasoning
                  </div>

                  <p className="text-sm leading-6 text-slate-300">
                    {getAgentReasoning(
                      agent.number
                    )}
                  </p>
                </div>

                <div
                  className={`mt-4 inline-block rounded-md px-3 py-1 text-xs font-bold ${getStatusClasses(
                    agent.number
                  )}`}
                >
                  {getAgentStatus(
                    agent.number
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STRATEGY + RISK */}
        <section className="mb-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="text-xl font-bold">
              Strategy Proposal
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric
                title="ACTION"
                value={
                  analyzed
                    ? analysisResult?.strategy
                        ?.action ?? "—"
                    : "—"
                }
              />

              <Metric
                title="ENTRY"
                value={
                  analyzed
                    ? `₹${
                        analysisResult?.strategy
                          ?.entry ?? "—"
                      }`
                    : "—"
                }
              />

              <Metric
                title="TARGET"
                value={
                  analyzed
                    ? `₹${
                        analysisResult?.strategy
                          ?.target ?? "—"
                      }`
                    : "—"
                }
              />

              <Metric
                title="STOP LOSS"
                value={
                  analyzed
                    ? `₹${
                        analysisResult?.strategy
                          ?.stopLoss ?? "—"
                      }`
                    : "—"
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="text-xl font-bold">
              Risk Assessment
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric
                title="RISK SCORE"
                value={
                  analyzed
                    ? `${
                        analysisResult?.risk
                          ?.riskScore ?? "—"
                      } / 100`
                    : "—"
                }
              />

              <Metric
                title="RISK / REWARD"
                value={
                  analyzed
                    ? `${
                        analysisResult?.risk
                          ?.riskReward ?? "—"
                      } : 1`
                    : "—"
                }
              />

              <Metric
                title="EXPOSURE"
                value={
                  analyzed
                    ? analysisResult?.risk
                        ?.exposure ?? "—"
                    : "—"
                }
              />

              <Metric
                title="SENTIMENT"
                value={
                  analyzed
                    ? analysisResult
                        ?.sentiment
                        ?.sentiment ?? "—"
                    : "—"
                }
              />
            </div>
          </div>
        </section>

        {/* GEMINI CRITIC */}
        {analyzed && analysisResult && (
          <section className="mb-8 rounded-2xl border border-purple-900 bg-gradient-to-br from-slate-900 to-purple-950/20 p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-purple-400">
                  ✦ GEMINI AI • INDEPENDENT VALIDATION
                </div>

                <h2 className="mt-2 text-2xl font-bold">
                  Gemini AI Critic
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-purple-700 bg-purple-950 px-3 py-1 text-xs font-bold text-purple-300">
                  {analysisResult.critic
                    ?.poweredBy ??
                    "AI CRITIC"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    analysisResult.critic
                      ?.verdict === "PASS"
                      ? "bg-green-950 text-green-400"
                      : "bg-red-950 text-red-400"
                  }`}
                >
                  {
                    analysisResult.critic
                      ?.verdict
                  }
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-purple-900/50 bg-slate-950/60 p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-purple-400">
                AI Reasoning
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                {
                  analysisResult.critic
                    ?.reasoning
                }
              </p>
            </div>

            {analysisResult.critic
              ?.contradictions?.length >
              0 && (
              <div className="mt-4 rounded-xl border border-red-900 bg-red-950/20 p-5">
                <div className="mb-3 text-sm font-bold text-red-400">
                  Blocking Issues
                </div>

                {analysisResult.critic.contradictions.map(
                  (
                    item: string,
                    index: number
                  ) => (
                    <p
                      key={index}
                      className="mt-2 text-sm text-slate-300"
                    >
                      ⚠ {item}
                    </p>
                  )
                )}
              </div>
            )}

            <div className="mt-4 rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Safety Architecture
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Gemini provides independent
                reasoning and critique. Final
                simulated execution authority
                remains with the deterministic
                Execution Guard.
              </p>
            </div>
          </section>
        )}

        {/* FINAL DECISION */}
        <section
          className={`rounded-2xl border p-8 ${
            analyzed
              ? decision === "APPROVED"
                ? "border-green-700 bg-green-950/30"
                : "border-red-700 bg-red-950/30"
              : "border-slate-800 bg-slate-900"
          }`}
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-blue-400">
                  EXECUTION GUARD
                </span>

                <span className="rounded-full border border-emerald-900 bg-emerald-950 px-2 py-1 text-[10px] font-bold text-emerald-400">
                  DETERMINISTIC SAFETY GATE
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-bold">
                Final Trade Decision
              </h2>

              {!analyzed && !loading && (
                <p className="mt-2 text-slate-400">
                  Run the multi-agent workflow
                  to generate a decision.
                </p>
              )}

              {loading && (
                <p className="mt-2 text-yellow-400">
                  Agent {activeAgent} of 6 is
                  evaluating the trade...
                </p>
              )}

              {analyzed &&
                analysisResult && (
                  <>
                    <div
                      className={`mt-4 text-3xl font-black ${
                        decision ===
                        "APPROVED"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {decision ===
                      "APPROVED"
                        ? "✓ TRADE APPROVED"
                        : "✕ TRADE BLOCKED"}
                    </div>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                      {
                        analysisResult
                          .execution
                          ?.reason
                      }
                    </p>
                  </>
                )}

              {error && (
                <p className="mt-3 text-sm text-red-400">
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={runAnalysis}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-7 py-4 font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {loading
                ? `Running Agent ${activeAgent}/6...`
                : analyzed
                  ? "Run Analysis Again"
                  : "Run Multi-Agent Analysis"}
            </button>
          </div>
        </section>

        {/* SIMULATED EXECUTION */}
        {analyzed &&
          analysisResult && (
            <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Paper Trading Layer
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Simulated Execution
                  </h2>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    analysisResult.execution
                      .execute
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {
                    analysisResult
                      .execution
                      .executionStatus
                  }
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <ExecutionMetric
                  title="SYMBOL"
                  value={
                    analysisResult.market
                      .symbol
                  }
                />

                <ExecutionMetric
                  title="ACTION"
                  value={
                    analysisResult
                      .execution.action
                  }
                />

                <ExecutionMetric
                  title="ENTRY"
                  value={`₹${analysisResult.execution.entry}`}
                />

                <ExecutionMetric
                  title="TARGET"
                  value={`₹${analysisResult.execution.target}`}
                />

                <ExecutionMetric
                  title="STOP LOSS"
                  value={`₹${analysisResult.execution.stopLoss}`}
                />
              </div>

              <div
                className={`mt-5 rounded-xl border p-4 ${
                  analysisResult.execution
                    .execute
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                <p
                  className={`font-semibold ${
                    analysisResult
                      .execution.execute
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {analysisResult.execution
                    .execute
                    ? "✓ SIMULATED TRADE EXECUTED"
                    : "✕ EXECUTION PREVENTED"}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {
                    analysisResult
                      .execution.reason
                  }
                </p>
              </div>

              <p className="mt-4 text-xs text-slate-600">
                Simulation only • No brokerage
                order or real-money trade was
                placed.
              </p>
            </section>
          )}

        {/* DECISION AUDIT TRAIL */}
        {auditHistory.length > 0 && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Explainable Decision History
                </p>

                <h2 className="mt-1 text-xl font-semibold text-white">
                  Decision Audit Trail
                </h2>
              </div>

              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                {auditHistory.length} RECORDS
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {auditHistory.map(
                (record) => (
                  <div
                    key={record.id}
                    className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-6 md:items-center"
                  >
                    <AuditField
                      title="TIME"
                      value={record.time}
                    />

                    <AuditField
                      title="SYMBOL"
                      value={
                        record.symbol
                      }
                    />

                    <AuditField
                      title="STRATEGY"
                      value={
                        record.action
                      }
                    />

                    <AuditField
                      title="RISK"
                      value={`${record.riskScore}/100`}
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        AI CRITIC
                      </p>

                      <p
                        className={`mt-1 text-sm font-semibold ${
                          record.critic ===
                          "PASS"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {
                          record.critic
                        }
                      </p>

                      <p className="mt-1 text-[10px] text-purple-400">
                        {
                          record.poweredBy
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        DECISION
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                          record.decision ===
                          "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {
                          record.decision
                        }
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            <button
              onClick={() => {
                localStorage.removeItem(
                  "tradeguard-audit-history"
                );

                setAuditHistory([]);
              }}
              className="mt-5 text-xs text-slate-500 transition hover:text-white"
            >
              Clear audit history
            </button>
          </section>
        )}

        <footer className="mt-12 text-center text-xs text-slate-600">
          TradeGuard AI • Hybrid Agentic
          Decision-Support Prototype • Gemini
          Integrated • Simulated Trading Only
        </footer>
      </div>
    </main>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-xs font-semibold text-slate-500">
        {title}
      </div>

      <div className="mt-2 text-xl font-bold text-slate-100">
        {value}
      </div>
    </div>
  );
}

function ExecutionMetric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function AuditField({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}