/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../types";
import { 
  Play, Terminal, RefreshCw, BarChart2, MessageSquare, 
  Settings, AlertCircle, HelpCircle, CheckCircle, Smartphone 
} from "lucide-react";

interface SandboxModuleProps {
  user: User;
}

export default function SandboxModule({ user }: SandboxModuleProps) {
  const [logs, setLogs] = useState<string[]>([
    "Test mode environment loaded.",
    "Safe mode activated: simulate sending and receiving messages without any costs or alerts to real customers.",
    "Ready. Click any action block below to run a safe simulation."
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [sandboxMetric, setSandboxMetric] = useState({
    sent: 10,
    delivered: 10,
    read: 8,
    replied: 2
  });

  const appendLogs = (newLogs: string[]) => {
    setLogs(prev => [...prev, ...newLogs.map(l => `[${new Date().toLocaleTimeString()}] ${l}`)]);
  };

  const runSimulation = async (actionType: string) => {
    setIsRunning(true);
    try {
      appendLogs([`Starting test action: ${actionType.toUpperCase().replace("_", " ")}`]);
      
      const res = await fetch("/api/sandbox/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType })
      });
      const data = await res.json();
      
      // Simulate realistic action lag
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Humanize output logs beautifully
      const formattedLogs = data.logs ? data.logs.map((log: string) => {
        return log
          .replace(/Sandbox Transport/gi, "Test Mode Carrier Channel")
          .replace(/packet/gi, "message")
          .replace(/isolated test framework/gi, "safe testing context")
          .replace(/telemetry/gi, "test updates")
          .replace(/dryrun/gi, "simulation test")
          .replace(/escalation/gi, "support request")
          .replace(/protocol/gi, "connected channel")
          .replace(/dispatch/gi, "sending");
      }) : [];
      
      appendLogs(formattedLogs);
      
      // Mutate mock metrics
      if (actionType === "whatsapp_receipts") {
        setSandboxMetric(prev => ({
          sent: prev.sent + 1,
          delivered: prev.delivered + 1,
          read: prev.read + 1,
          replied: prev.replied + (Math.random() > 0.5 ? 1 : 0)
        }));
      } else if (actionType === "sms_bulk_run") {
        setSandboxMetric(prev => ({
          ...prev,
          sent: prev.sent + 10,
          delivered: prev.delivered + 10,
          read: prev.read + 6,
        }));
      }
      
    } catch (err) {
      appendLogs(["Test action session failed due to a network simulation timeout."]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => {
    setLogs([`Console cleared. Test mode environment active.`]);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#fafafa] font-sans">
      {/* Banner */}
      <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4 border-b border-white/10 bg-[#09090b]/50 backdrop-blur-sm p-6 sticky top-0 z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1 font-bold">
            Interactive Test Mode
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>Test Mode ("Try before going live")</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Safely test out scheduled messages and automated actions prior to reaching real customers.
          </p>
        </div>
        <div>
          <button
            id="sandbox-clear-logs"
            onClick={clearLogs}
            className="px-3 py-1.5 bg-[#18181b]/60 hover:bg-[#27272a]/60 border border-white/10 hover:border-indigo-500/30 text-zinc-300 rounded-lg text-xs font-medium cursor-pointer transition-all"
          >
            Clear Console Logs
          </button>
        </div>
      </div>

      {/* Grid layouts */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        {/* Left Interactive panel */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin space-y-6">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Simulated Statistics Summary</h3>
            <p className="text-xs text-zinc-400 mb-4">See how messaging metrics fluctuate during your tests.</p>
            
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Sent</span>
                <span className="text-lg font-bold text-white mt-1 block">{sandboxMetric.sent}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-mono text-emerald-450 block uppercase">Delivered</span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">{sandboxMetric.delivered}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-mono text-indigo-400 block uppercase">Read</span>
                <span className="text-lg font-bold text-indigo-400 mt-1 block">{sandboxMetric.read}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-mono text-purple-400 block uppercase">Replied</span>
                <span className="text-lg font-bold text-purple-400 mt-1 block">{sandboxMetric.replied}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-555">Run Safe Performance Simulations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event 1 */}
              <div className="glass-card p-5 hover:border-white/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 px-1.5 bg-green-950/30 text-green-400 border border-green-800/40 rounded text-[9px] font-mono font-bold">WHATSAPP</span>
                    <h4 className="text-xs font-semibold text-white">WhatsApp Delivery Simulator</h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Sends a mock message to Esther Howard and registers receipt verification status codes without emailing or contacting real-world contacts.
                  </p>
                </div>
                <button
                  id="trigger-sim-whatsapp"
                  disabled={isRunning}
                  onClick={() => runSimulation("whatsapp_receipts")}
                  className="mt-4 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/15"
                >
                  <Play className="w-3.5 h-3.5 shrink-0" />
                  <span>{isRunning ? "Sending..." : "Test Message Delivery"}</span>
                </button>
              </div>

              {/* Event 2 */}
              <div className="glass-card p-5 hover:border-white/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 px-1.5 bg-indigo-950/30 text-indigo-400 border border-indigo-800/40 rounded text-[9px] font-mono font-bold">AUTOMATION</span>
                    <h4 className="text-xs font-semibold text-white">Automated Actions Simulation</h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Simulates your customer onboarding response loop. Triggers and tests automated sentiment check responses in a safe environment.
                  </p>
                </div>
                <button
                  id="trigger-sim-workflow"
                  disabled={isRunning}
                  onClick={() => runSimulation("workflow_test")}
                  className="mt-4 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/15"
                >
                  <Play className="w-3.5 h-3.5 shrink-0" />
                  <span>{isRunning ? "Processing..." : "Test Automated Action List"}</span>
                </button>
              </div>

              {/* Event 3 */}
              <div className="glass-card p-5 hover:border-white/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 px-1.5 bg-purple-950/30 text-purple-400 border border-purple-800/40 rounded text-[9px] font-mono font-bold">BULK SMS</span>
                    <h4 className="text-xs font-semibold text-white">Bulk text sending test</h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Sends a slice of 10 mock text messages simultaneously to stress-test high delivery speed counters without any costs.
                  </p>
                </div>
                <button
                  id="trigger-sim-sms"
                  disabled={isRunning}
                  onClick={() => runSimulation("sms_bulk_run")}
                  className="mt-4 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/15"
                >
                  <Play className="w-3.5 h-3.5 shrink-0" />
                  <span>{isRunning ? "Sending bulk..." : "Test Bulk SMS Delivery"}</span>
                </button>
              </div>

              {/* Event 4 */}
              <div className="glass-card p-5 hover:border-white/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 px-1.5 bg-zinc-850 text-zinc-300 border border-white/5 rounded text-[9px] font-mono font-bold">SUPPORT</span>
                    <h4 className="text-xs font-semibold text-white">Urgent Support Alert Simulation</h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Creates an instant mock customer query, simulating live notification alarms and checking response countdown timer speeds.
                  </p>
                </div>
                <button
                  id="trigger-sim-escalation"
                  disabled={isRunning}
                  onClick={() => runSimulation("escalation_breach")}
                  className="mt-4 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/15"
                >
                  <Play className="w-3.5 h-3.5 shrink-0" />
                  <span>{isRunning ? "Simulating..." : "Test Response Alert"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side diagnostics console logs */}
        <div className="w-full lg:w-96 bg-[#09090b]/35 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-96 lg:h-full overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/[0.01]/40 flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Test Action Console Logs</span>
            </span>
          </div>

          <div className="flex-1 p-4 bg-[#09090b] font-mono text-[11px] text-[#22C55E] overflow-y-auto space-y-2 leading-relaxed scrollbar-thin selection:bg-indigo-950">
            {logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap select-text hover:bg-white/[0.01] px-1 py-0.5 rounded">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
