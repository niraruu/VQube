/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Ticket, TicketPriority, TicketStatus, User } from "../types";
import { 
  LifeBuoy, ShieldAlert, Sparkles, UserCheck, MessageSquare, 
  Calendar, PhoneCall, Clock, CheckCircle2, AlertCircle, BarChart2 
} from "lucide-react";

interface SupportModuleProps {
  user: User;
}

export default function SupportModule({ user }: SupportModuleProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Callback Form states
  const [showCallbackPopover, setShowCallbackPopover] = useState(false);
  const [cbDateTime, setCbDateTime] = useState("");
  const [cbPhone, setCbPhone] = useState("");
  const [cbNote, setCbNote] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
      
      if (data.tickets?.length > 0 && !selectedTicket) {
        setSelectedTicket(data.tickets[0]);
      } else if (selectedTicket) {
        // preserve selection
        const updated = data.tickets.find((t: any) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // progressive live pull
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: string, status: TicketStatus) => {
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText })
      });
      if (res.ok) {
        setReplyText("");
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAISummarize = async (id: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/tickets/${id}/analyze`, { method: "POST" });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScheduleCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cbDateTime || !cbPhone || !selectedTicket) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime: cbDateTime,
          phone: cbPhone,
          note: cbNote
        })
      });
      if (res.ok) {
        setShowCallbackPopover(false);
        setCbDateTime("");
        setCbPhone("");
        setCbNote("");
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPriorityColorClass = (pr: TicketPriority) => {
    switch (pr) {
      case TicketPriority.URGENT: return "bg-red-500/10 border-red-500/30 text-red-400";
      case TicketPriority.HIGH: return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case TicketPriority.MEDIUM: return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      default: return "bg-gray-500/10 border-gray-500/30 text-gray-400";
    }
  };

  const getStatusColorClass = (st: TicketStatus) => {
    switch (st) {
      case TicketStatus.OPEN: return "text-blue-400 border-blue-500/20 bg-blue-500/5";
      case TicketStatus.IN_PROGRESS: return "text-purple-400 border-purple-500/20 bg-purple-500/5";
      case TicketStatus.ESCALATED: return "text-amber-400 border-amber-500/20 bg-amber-500/5 animate-pulse";
      case TicketStatus.RESOLVED: return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      default: return "text-zinc-500 border-zinc-700/20 bg-zinc-700/5";
    }
  };

  const getSentimentEmoji = (sent: string) => {
    if (sent === "positive") return "😊 Friendly";
    if (sent === "negative") return "😟 Frustrated";
    return "😐 Neutral";
  };

  const getSentimentColor = (sent: string) => {
    if (sent === "positive") return "text-emerald-400 bg-emerald-950/20 border border-emerald-900/50";
    if (sent === "negative") return "text-red-400 bg-red-950/20 border border-red-900/50";
    return "text-zinc-400 bg-zinc-805/30 border border-zinc-750";
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#fafafa] font-sans">
      {/* Banner */}
      <div className="flex justify-between items-center border-b border-white/10 bg-[#09090b]/50 backdrop-blur-sm p-6 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-indigo-400" />
            <span>Customer Conversations</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Answer questions and view support requests. Keep track of customer satisfaction and AI conversation summaries.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-550">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-emerald-500" />
            Brand targets: Active
          </span>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Ticket Grid lists */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin space-y-4">
          <div className="px-1 mb-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500">Active Conversations</div>
          
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 bg-[#18181b]/40 border rounded-xl cursor-pointer hover:border-zinc-700 transition-all flex justify-between gap-4 ${
                  selectedTicket?.id === t.id ? "border-indigo-650 bg-indigo-950/10" : "border-white/10"
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono border font-bold ${getPriorityColorClass(t.priority)}`}>
                      {t.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono border font-semibold ${getStatusColorClass(t.status)}`}>
                      {t.status}
                    </span>
                    <span className="text-[10px] text-zinc-550 font-mono">Reference ID: {t.id}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-white mt-1">{t.title}</h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 leading-relaxed">{t.description}</p>
                </div>

                <div className="text-right shrink-0 flex flex-col justify-between items-end">
                  <span className="text-[9px] font-mono text-zinc-500">{new Date(t.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${getSentimentColor(t.aiSentiment)}`}>
                      {getSentimentEmoji(t.aiSentiment)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Active Ticket panel detail with Chat thread / AI Summarization / Call scheduler */}
        {selectedTicket && (
          <div className="w-full lg:w-110 bg-[#0c0c0e] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-full overflow-hidden">
            {/* Meta details */}
            <div className="p-5 border-b border-white/10 bg-white/[0.01]/40 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono text-zinc-500 uppercase">SUBJECT</div>
                  <h4 className="text-sm font-bold text-white truncate max-w-[250px]">{selectedTicket.title}</h4>
                </div>
                {/* AI Recalculate summary */}
                <button
                  id={`ai-summarize-ticket-${selectedTicket.id}`}
                  disabled={isAnalyzing}
                  onClick={() => triggerAISummarize(selectedTicket.id)}
                  className="px-2 py-1 text-[9px] font-mono text-indigo-400 hover:text-white bg-indigo-950/20 border border-indigo-900/30 rounded-md transition-all flex items-center gap-1 cursor-pointer select-none"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>{isAnalyzing ? "Analyzing..." : "Update summary"}</span>
                </button>
              </div>

              {/* AI Generative Summary Board */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/35 rounded-lg flex gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                <div>
                  <div className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                    AI Conversation Summary
                  </div>
                  <p className="text-[11px] text-zinc-300 italic leading-relaxed mt-1">"{selectedTicket.aiSummary}"</p>
                </div>
              </div>

              {/* SLA indicators and Escalation trigger */}
              <div className="flex items-center justify-between mt-1 text-[11px] border-t border-white/5 pt-2.5">
                <span className="flex items-center gap-1 text-zinc-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Suggested response: {selectedTicket.slaLimitMinutes}m limit
                </span>

                {/* ESCALATION TRIGGER PLACEHOLDER */}
                <div className="relative">
                  <button
                    id="schedule-voice-callback-btn"
                    onClick={() => setShowCallbackPopover(prev => !prev)}
                    className="p-1 px-1.5 bg-amber-500 text-black rounded text-[10px] font-bold font-mono tracking-wide flex items-center gap-1 transition-all cursor-pointer shadow shadow-amber-500/20 hover:scale-[1.02]"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Schedule Call
                  </button>

                  {/* Callback scheduler box */}
                  {showCallbackPopover && (
                    <div className="absolute right-0 bottom-8 bg-zinc-900 border border-white/10 rounded-xl p-4 shadow-2xl w-80 z-50 font-sans text-zinc-300">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
                        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-amber-400">Schedule phone callback</span>
                        <button onClick={() => setShowCallbackPopover(false)} className="text-[9px] font-mono text-zinc-400 hover:text-white cursor-pointer font-bold">✕</button>
                      </div>

                      <form onSubmit={handleScheduleCallback} className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">Direct phone number</label>
                          <input
                            id="cb-form-phone"
                            type="tel"
                            required
                            value={cbPhone}
                            onChange={(e) => setCbPhone(e.target.value)}
                            placeholder={selectedTicket.contactPhone}
                            className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-white/10 focus:outline-none focus:border-amber-500/50 rounded text-white font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          <label className="block text-[9px] font-mono uppercase text-zinc-500">Date/Time Slot</label>
                          <input
                            id="cb-form-datetime"
                            type="datetime-local"
                            required
                            value={cbDateTime}
                            onChange={(e) => setCbDateTime(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-white/10 focus:outline-none focus:border-amber-500/50 rounded text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">Callback notes</label>
                          <input
                            id="cb-form-note"
                            type="text"
                            value={cbNote}
                            onChange={(e) => setCbNote(e.target.value)}
                            placeholder="Help correct communication issue..."
                            className="w-full px-2 py-1.5 text-xs bg-zinc-950 border border-white/10 focus:outline-none focus:border-amber-500/50 rounded text-white"
                          />
                        </div>
                        <button
                          id="submit-callback-escalation"
                          type="submit"
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded cursor-pointer"
                        >
                          Schedule callback
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conversation list stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin bg-black/25">
              <div className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-xs leading-relaxed text-zinc-350">
                <span className="text-[10px] font-mono font-semibold text-indigo-400 uppercase block mb-1">Initial message</span>
                "{selectedTicket.description}"
              </div>

              {/* Log callbacks if exists */}
              {selectedTicket.callbackDetails && (
                <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded-xl flex gap-2 text-xs animate-fadeIn">
                  <PhoneCall className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 block uppercase">Phone call scheduled</span>
                    <div className="text-zinc-300 mt-1">Time: {new Date(selectedTicket.callbackDetails.dateTime).toLocaleString()}</div>
                    <div className="text-zinc-400 text-[11px] mt-0.5">Note: {selectedTicket.callbackDetails.note || "None"}</div>
                  </div>
                </div>
              )}

              {/* Staff and System responses */}
              <div className="space-y-3">
                {selectedTicket.activities.map((act, index) => {
                  const isStaff = act.author !== "System" && act.author !== "System AI" && act.author !== "OmniChannel AI";
                  return (
                    <div key={index} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3 rounded-xl max-w-[280px] text-xs ${
                        isStaff
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-zinc-900 border border-white/5 text-zinc-300 rounded-tl-none"
                      }`}>
                        <div className={`text-[9px] font-mono ${isStaff ? "text-indigo-200" : "text-zinc-500"} mb-1`}>
                          {act.author}
                        </div>
                        <p className="leading-relaxed">{act.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Answer input belt */}
            <form onSubmit={handlePostReply} className="p-3 bg-zinc-900/50 border-t border-white/10 flex gap-2 shrink-0">
              <input
                id="support-reply-input"
                type="text"
                placeholder="Write a reply to the customer..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-[#09090b] border border-white/10 focus:outline-none focus:border-indigo-500/50 rounded-lg text-white font-sans"
              />
              <button
                id="support-reply-submit"
                type="submit"
                disabled={isLoading || !replyText.trim()}
                className="px-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
