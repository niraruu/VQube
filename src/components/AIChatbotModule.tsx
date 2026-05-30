/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { AIPersona, AIChatMessage, AIChatLog, User } from "../types";
import { 
  Bot, Send, Settings, History, Sparkles, Sliders, AlertCircle, 
  Trash2, HelpCircle, FileJson, CheckCircle, ShieldAlert 
} from "lucide-react";

interface AIChatbotModuleProps {
  user: User;
}

export default function AIChatbotModule({ user }: AIChatbotModuleProps) {
  const [personas, setPersonas] = useState<AIPersona[]>([]);
  const [activePersona, setActivePersona] = useState<AIPersona | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [logs, setLogs] = useState<AIChatLog[]>([]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "personas" | "logs">("chat");

  // Persona editor state
  const [editorName, setEditorName] = useState("");
  const [editorInstruction, setEditorInstruction] = useState("");
  const [editorTemperature, setEditorTemperature] = useState(0.7);
  const [editorDesc, setEditorDesc] = useState("");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const pRes = await fetch("/api/ai/personas");
      const pData = await pRes.json();
      setPersonas(pData.personas || []);
      
      const active = pData.personas?.find((p: any) => p.isActive) || pData.personas?.[0];
      if (active) {
        setActivePersona(active);
        setEditorName(active.name);
        setEditorInstruction(active.systemInstruction);
        setEditorTemperature(active.temperature);
        setEditorDesc(active.description || "");
      }

      // Read history messages on setup
      // Note: we can mock standard messages or call endpoint
      const resMsg = await fetch("/api/ai/chat/clear", { method: "POST" }); // Reset preview for pristine turns
      setMessages([
        { id: "m-init", sender: "bot", text: `Hello! I have activated the "${active?.name || 'Support Hero'}" AI Persona instructions. Ask me any question about webhook setups, India DPDP opt-in guidelines, or campaign triggers.`, timestamp: new Date().toISOString() }
      ]);

      const logRes = await fetch("/api/ai/logs");
      const logData = await logRes.json();
      setLogs(logData.logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activePersona) return;

    const userText = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Optimistically push user bubble
    const userMsg: AIChatMessage = {
      id: "opt-u-" + Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          personaId: activePersona.id
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, data.botMessage]);
      
      // Update logs tab
      const logRes = await fetch("/api/ai/logs");
      const logData = await logRes.json();
      setLogs(logData.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePersona = async () => {
    if (!activePersona) return;
    try {
      const updatedObj = {
        ...activePersona,
        name: editorName,
        systemInstruction: editorInstruction,
        temperature: editorTemperature,
        description: editorDesc
      };

      const res = await fetch("/api/ai/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedObj)
      });
      const data = await res.json();
      
      setPersonas(prev => prev.map(p => p.id === data.persona.id ? data.persona : p));
      setActivePersona(data.persona);
      
      alert("AI Persona successfully synchronized. New prompts applied immediately to active workflows!");
    } catch (e) {
      console.error(e);
    }
  };

  const selectPersona = (p: AIPersona) => {
    setActivePersona(p);
    setEditorName(p.name);
    setEditorInstruction(p.systemInstruction);
    setEditorTemperature(p.temperature);
    setEditorDesc(p.description || "");
    
    // reset context messages
    setMessages([
      { id: "m-switch-" + Date.now(), sender: "bot", text: `I have activated instruction set: "${p.name}". I am now fully synchronized to support user interactions based on these guidelines.`, timestamp: new Date().toISOString() }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#fafafa] font-sans">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 bg-[#09090b]/50 backdrop-blur-sm p-6 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span>AI Assistant Center</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage how your AI helper answers support requests. Pick a professional voice, or a warm, conversational mode that fits your brand.
          </p>
        </div>
        <div className="flex gap-1.5 bg-[#18181b]/60 border border-white/10 p-0.5 rounded-lg w-full md:w-auto">
          <button
            id="chatbot-tab-play"
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 text-xs rounded-md transition-all font-semibold cursor-pointer flex-1 md:flex-initial text-center ${
              activeTab === "chat" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Try Chatting
          </button>
          <button
            id="chatbot-tab-personas"
            onClick={() => setActiveTab("personas")}
            className={`px-3 py-1.5 text-xs rounded-md transition-all font-semibold cursor-pointer flex-1 md:flex-initial text-center ${
              activeTab === "personas" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Assistant Styles ({personas.length})
          </button>
          <button
            id="chatbot-tab-logs"
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-1.5 text-xs rounded-md transition-all font-semibold cursor-pointer flex-1 md:flex-initial text-center ${
              activeTab === "logs" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            AI Activity Logs ({logs.length})
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === "chat" && (
          <>
            {/* Persona Quick Picker sidebar */}
            <div className="w-64 shrink-0 border-r border-white/10 bg-[#18181b]/20 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-thin">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Available Assistant Styles</span>
              {personas.map((p) => {
                const isSelected = activePersona?.id === p.id;
                return (
                  <button
                    id={`persona-select-btn-${p.id}`}
                    key={p.id}
                    onClick={() => selectPersona(p)}
                    className={`w-full p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-950/20 border-indigo-500 text-white"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      {p.name}
                    </span>
                    <span className="text-[10px] text-zinc-450 line-clamp-2 leading-relaxed">{p.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Chat Playground */}
            <div className="flex-grow flex flex-col h-full bg-[#09090b]/20">
              {/* Active instruction bar */}
              <div className="p-3 bg-[#18181b]/30 border-b border-b-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400 px-6">
                <span className="flex items-center gap-1.5 text-zinc-450">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400 font-bold" />
                  Tone warmth: {activePersona?.temperature}
                </span>
                <span className="text-zinc-600">Engine: Smart Assistant Response</span>
              </div>

              {/* Bubbles Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md rounded-2xl p-4 shadow-xl ${
                      m.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "glass-card text-[#fafafa] rounded-bl-none"
                    }`}>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-405 mb-1.5 gap-4">
                        <span className="font-bold">{m.sender === "user" ? "Outbound Manager" : activePersona?.name || "AI Bot"}</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      
                      {m.isSimulated && (
                        <span className="inline-flex items-center gap-1 mt-2 text-[9px] font-mono text-indigo-300 uppercase">
                          <AlertCircle className="w-3 h-3 text-indigo-405" />
                          Simulated Local Run
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="glass-card rounded-2xl rounded-bl-none p-4 text-xs font-mono text-zinc-400 flex items-center gap-2">
                      <div className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span>AI is crafting a suggested response...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Inputs belt */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#18181b]/30 border-t border-white/10 flex gap-3">
                <input
                  id="chat-playground-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Ask ${activePersona?.name || 'AI Assistant'} something or run webhooks testing prompts...`}
                  className="flex-1 px-4 py-2 text-xs bg-[#18181b]/60 border border-white/10 focus:outline-none focus:border-indigo-500/50 rounded-xl text-white font-sans"
                />
                <button
                  id="chat-playground-send"
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="p-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-indigo-500/15"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </>
        )}

        {activeTab === "personas" && activePersona && (
          <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin">
            <div className="max-w-2xl glass-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">Configure AI Assistant Style ({activePersona.name})</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-450 mb-1">
                    Assistant Profile Name
                  </label>
                  <input
                    id="persona-editor-name"
                    type="text"
                    value={editorName}
                    onChange={(e) => setEditorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-455 mb-1">
                    Dialogue Warmth / Flexibility (0.1 - 1.0)
                  </label>
                  <input
                    id="persona-editor-temp"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1.0"
                    value={editorTemperature}
                    onChange={(e) => setEditorTemperature(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none font-mono focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-450 mb-1">
                  Style Description & Vibe
                </label>
                <input
                  id="persona-editor-desc"
                  type="text"
                  value={editorDesc}
                  onChange={(e) => setEditorDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-455 mb-1">
                  AI Assistant System Guidelines / Instructions
                </label>
                <textarea
                  id="persona-editor-prompt"
                  value={editorInstruction}
                  onChange={(e) => setEditorInstruction(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none font-sans leading-relaxed resize-none focus:border-indigo-500/50"
                />
              </div>

              <button
                id="save-persona-prompt-btn"
                onClick={handleSavePersona}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-500/15"
              >
                Apply New Guidelines Immediately
              </button>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
            <div className="glass-card overflow-hidden shadow-2xl">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Request Summary</th>
                    <th className="p-4">AI Suggested Reply</th>
                    <th className="p-4">AI Usage</th>
                    <th className="p-4">Response Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-mono text-[10px] text-zinc-500 text-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="font-sans text-xs text-zinc-300 max-w-[200px] truncate">{log.prompt}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-zinc-404 max-w-[320px] truncate">{log.response}</div>
                      </td>
                      <td className="p-4 font-sans text-zinc-400 text-xs">
                        {Math.round(log.tokensUsed / 10)} units
                      </td>
                      <td className="p-4">
                        {log.isFallback ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-405 text-[10px] font-mono uppercase font-bold text-[9px]">
                            Simulated Reply
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase font-bold text-[9px]">
                            AI Smart Reply
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-zinc-500 italic font-mono">
                        No active assistant operations checked today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
