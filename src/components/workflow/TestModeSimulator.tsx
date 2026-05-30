/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CustomizedAction, FriendlyStep, BusinessProduct, SimulationStepLog } from "./workflowTypes";
import { 
  Play, Sparkles, MessageSquare, ShieldAlert, CheckCircle, Smartphone, 
  Send, Bot, CornerDownRight, Phone, AlertCircle, RefreshCw, UserCheck 
} from "lucide-react";

interface TestModeSimulatorProps {
  action: CustomizedAction;
  activeProduct: BusinessProduct;
}

export default function TestModeSimulator({ action, activeProduct }: TestModeSimulatorProps) {
  const [customerName, setCustomerName] = useState("Alex Rivers");
  const [customerPhone, setCustomerPhone] = useState("+1 (555) 789-3241");
  const [customerStance, setCustomerStance] = useState<"happy" | "neutral" | "frustrated">("frustrated");
  
  const [simulationLogs, setSimulationLogs] = useState<SimulationStepLog[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(-1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simCompleted, setSimCompleted] = useState(false);

  // Restart or initialize the logs list
  const startSimulation = () => {
    setIsSimulating(true);
    setSimCompleted(false);
    setCurrentStepIdx(0);
    
    setSimulationLogs([
      {
        id: "sim-1",
        stepIdx: 0,
        label: "Starts When",
        status: "running",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  useEffect(() => {
    if (!isSimulating || currentStepIdx < 0 || currentStepIdx >= action.steps.length) return;

    // Simulate step timing
    const timer = setTimeout(() => {
      const step = action.steps[currentStepIdx];
      let outputText = "";
      let nStatus: SimulationStepLog["status"] = "success";

      // Customize outcomes based on customer stance & step type
      if (step.type === "trigger") {
        outputText = `Detected event trigger on service: ${activeProduct.name}. Found match metadata record for ${customerName}.`;
      } else if (step.type === "ai_action") {
        const toneStr = action.aiToneSelection;
        outputText = `AI Agent analyzed sentiment index: ${customerStance.toUpperCase()}. Dynamically applying message configuration using '${toneStr}' personality protocol.`;
      } else if (step.type === "campaign") {
        let textDraft = step.config.messageText || "Welcome to our customized service!";
        // Replace templates
        textDraft = textDraft
          .replace("{{customer_name}}", customerName)
          .replace("{{product_name}}", activeProduct.name);
        outputText = `Successfully dispatched content: "${textDraft}"`;
      } else if (step.type === "condition") {
        if (customerStance === "frustrated") {
          nStatus = "escalated";
          outputText = `Rule evaluated: customer sentiment marked negative. Triggering human escalation rules instantly.`;
        } else {
          nStatus = "completed";
          outputText = `Rule evaluated: safe positive stance resolved. Triggering normal completion state successfully.`;
        }
      } else if (step.type === "escalation") {
        if (customerStance === "frustrated") {
          nStatus = "escalated";
          outputText = `🚨 Humans notified: [${step.config.escalationMethod || 'Escalate task'}] initiated. Ringing CRM agents. Outbound hotline assigned: ${action.callSettings.directLine}.`;
        } else {
          outputText = `Escalation step bypassed. Customer resolved.`;
        }
      }

      // Update current step to success/finished
      setSimulationLogs(prev => {
        const copy = [...prev];
        if (copy[currentStepIdx]) {
          copy[currentStepIdx] = {
            ...copy[currentStepIdx],
            status: nStatus,
            outputMessage: outputText
          };
        }
        return copy;
      });

      // Move to next step or complete
      if (currentStepIdx < action.steps.length - 1) {
        const nextIdx = currentStepIdx + 1;
        const nextStep = action.steps[nextIdx];
        
        // Skip escalation step if customer satisfies rules normally
        if (nextStep.type === "escalation" && customerStance !== "frustrated") {
          setIsSimulating(false);
          setSimCompleted(true);
        } else {
          setCurrentStepIdx(nextIdx);
          setSimulationLogs(prev => [
            ...prev,
            {
              id: `sim-${nextIdx + 1}`,
              stepIdx: nextIdx,
              label: nextStep.label,
              status: "running",
              timestamp: new Date().toLocaleTimeString()
            }
          ]);
        }
      } else {
        setIsSimulating(false);
        setSimCompleted(true);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isSimulating, currentStepIdx]);

  const activeRunningStep = action.steps[currentStepIdx];

  // Helper values for WhatsApp mockup
  const mockWhatsAppText = () => {
    const campaignStep = action.steps.find(s => s.type === "campaign");
    if (!campaignStep) return "Preview draft will appear here.";
    let orig = campaignStep.config.messageText || "";
    return orig
      .replace("{{customer_name}}", customerName)
      .replace("{{product_name}}", activeProduct.name);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* Configuration panel */}
      <div className="md:col-span-5 space-y-5">
        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <span className="text-[10px] font-mono tracking-wider font-bold text-indigo-400 uppercase">Simulator Setup</span>
            <h3 className="text-xs font-bold text-white mt-0.5">Define Test Customer Journey</h3>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[9px] font-mono uppercase text-zinc-400 mb-1">Simulated Customer Name</label>
              <input
                id="sim-customer-name-field"
                type="text"
                className="w-full text-xs px-2.5 py-1.5 bg-zinc-950 border border-white/15 rounded-md text-white focus:outline-none"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono uppercase text-zinc-400 mb-1">Simulated Contact Number</label>
              <input
                id="sim-customer-phone-field"
                type="text"
                className="w-full text-xs px-2.5 py-1.5 bg-zinc-950 border border-white/15 rounded-md text-white focus:outline-none"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono uppercase text-zinc-400 mb-1">Tester Customer Mood (Toggles Rules logic!)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="stance-happy-btn"
                  type="button"
                  onClick={() => setCustomerStance("happy")}
                  className={`py-1.5 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer text-center ${
                    customerStance === "happy"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                      : "bg-zinc-950 border-white/5 hover:border-zinc-700 text-zinc-400"
                  }`}
                >
                  😀 Cooperative
                </button>
                <button
                  id="stance-neutral-btn"
                  type="button"
                  onClick={() => setCustomerStance("neutral")}
                  className={`py-1.5 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer text-center ${
                    customerStance === "neutral"
                      ? "bg-blue-500/15 border-blue-500 text-blue-300"
                      : "bg-zinc-950 border-white/5 hover:border-zinc-700 text-zinc-400"
                  }`}
                >
                  😐 Neutral
                </button>
                <button
                  id="stance-frustrated-btn"
                  type="button"
                  onClick={() => setCustomerStance("frustrated")}
                  className={`py-1.5 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer text-center ${
                    customerStance === "frustrated"
                      ? "bg-red-500/15 border-red-500 text-red-300"
                      : "bg-zinc-955 border-white/5 hover:border-zinc-700 text-zinc-400"
                  }`}
                >
                  ☹️ Frustrated
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                {customerStance === "frustrated" 
                  ? "☹️ Frustrated mood simulates Rules execution failure and triggers Request Human Support route sequence." 
                  : "😀 Cooperative / Neutral simulators bypass escalation and demonstrate complete automated actions resolution."}
              </p>
            </div>
          </div>

          <button
            id="simulation-trigger-btn"
            onClick={startSimulation}
            disabled={isSimulating}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-550 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Journey...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Journey Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* WhatsApp Mock Mobile Preview card Frame */}
        <div className="bg-[#090d16] border border-white/5 rounded-3xl p-4 shadow-xl select-none max-w-sm mx-auto relative overflow-hidden">
          {/* Top Speaker phone notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-950 rounded-full flex items-center justify-center border border-white/5">
            <span className="w-1.5 h-1.5 bg-zinc-850 rounded-full" />
          </div>

          <div className="pt-5 pb-1 flex items-center justify-between border-b border-white/5 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-400/20">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-white leading-none">Assistant Direct</h4>
                <p className="text-[8px] text-emerald-400 font-mono mt-0.5 leading-none">● Online / Test Active</p>
              </div>
            </div>
            <Smartphone className="w-4 h-4 text-zinc-650" />
          </div>

          {/* Chat threads body bubble */}
          <div className="space-y-2.5 h-[160px] overflow-y-auto p-1 text-[11px] leading-relaxed custom-scrollbar">
            {/* Outbound AI dispatch text preview */}
            <div className="bg-indigo-950/40 border border-indigo-500/10 rounded-2xl rounded-tl-none p-3 max-w-[85%] text-zinc-200">
              <div className="text-[8px] font-mono text-indigo-400 uppercase font-bold mb-1 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Customised WhatsApp Draft</span>
              </div>
              {mockWhatsAppText()}
            </div>

            {/* Answer simulations based on stance */}
            {simCompleted && (
              <div className="flex flex-col items-end w-full">
                <div className="bg-zinc-800/80 border border-white/5 rounded-2xl rounded-tr-none p-3 max-w-[80%] text-zinc-300">
                  <div className="text-[8px] font-mono text-zinc-400 uppercase font-bold mb-1">
                    Customer Answer ({customerStance})
                  </div>
                  {customerStance === "frustrated" 
                    ? "Actually, I am very annoyed. My delivery did not arrive yet!" 
                    : "Thanks! That answers my query. Have a nice index."}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Terminal Panel */}
      <div className="md:col-span-7 space-y-4">
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 shadow-inner">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full shrink-0" />
              <span className="w-3 h-3 bg-yellow-500 rounded-full shrink-0" />
              <span className="w-3 h-3 bg-green-500 rounded-full shrink-0" />
              <span className="text-xs font-mono font-bold text-zinc-400 ml-2">SIMULATION ENVIRONMENT TERM /*</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-455">16k PCM sample_rate</span>
          </div>

          <div className="mt-4 space-y-4 font-mono text-xs">
            {simulationLogs.map((log, index) => {
              const isRunning = log.status === "running";
              const isEscalated = log.status === "escalated";
              const isFinished = log.status === "success" || log.status === "completed";

              return (
                <div key={log.id} className="space-y-1 animation-fadeIn border-l border-zinc-800 pl-4 py-1 relative">
                  {/* Bullet indicator log */}
                  <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-zinc-950 border rounded-full flex items-center justify-center">
                    <span className={`w-1 h-1 rounded-full ${
                      isRunning ? "bg-indigo-400 animate-ping" : isEscalated ? "bg-amber-400" : isFinished ? "bg-emerald-400" : "bg-zinc-600"
                    }`} />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-zinc-300">{log.label} Step</span>
                    <span className="text-[9px] text-zinc-550">{log.timestamp}</span>
                  </div>

                  {isRunning && (
                    <div className="text-indigo-400 flex items-center gap-1.5 leading-none py-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                      <span>Checking telemetry logs...</span>
                    </div>
                  )}

                  {log.outputMessage && (
                    <p className={`text-[11px] leading-relaxed mt-0.5 ${isEscalated ? "text-amber-300 bg-amber-950/10 p-2 border border-amber-500/10 rounded-lg" : "text-zinc-400"}`}>
                      {index === 1 && <span className="text-zinc-500 pr-1 inline flex-wrap">&#10142;</span>}
                      {log.outputMessage}
                    </p>
                  )}
                </div>
              );
            })}

            {simulationLogs.length === 0 && (
              <div className="py-12 text-center text-zinc-600 text-[11px] select-none leading-relaxed italic">
                Terminal idle. Click "Run Journey Simulation" left to seed data parameters.
              </div>
            )}

            {simCompleted && (
              <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-emerald-400">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Interactive Sim Complete!</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  The automated action terminated correctly. Run metrics has been appended to diagnostic logs dashboard successfully.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
