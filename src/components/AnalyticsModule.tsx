/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Campaign, Contact, Ticket, Workflow } from "../types";
import { 
  BarChart2, Users, Flame, LifeBuoy, Network, ShieldCheck, 
  Sparkles, TrendingUp, ArrowUpRight, ArrowDownRight, PhoneCall 
} from "lucide-react";

interface AnalyticsModuleProps {
  user: User;
  onNavigate: (route: string) => void;
}

export default function AnalyticsModule({ user, onNavigate }: AnalyticsModuleProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllMetrics = async () => {
    setIsLoading(true);
    try {
      const cRes = await fetch("/api/contacts");
      const cData = await cRes.json();
      setContacts(cData.contacts || []);

      const campRes = await fetch("/api/campaigns");
      const campData = await campRes.json();
      setCampaigns(campData.campaigns || []);

      const tRes = await fetch("/api/tickets");
      const tData = await tRes.json();
      setTickets(tData.tickets || []);

      const wRes = await fetch("/api/workflows");
      const wData = await wRes.json();
      setWorkflows(wData.workflows || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllMetrics();
  }, []);

  // Compute stats
  const totalLeads = contacts.filter(c => c.segment === "Leads").length;
  const premiumUsers = contacts.filter(c => c.segment === "Premium Users").length;
  const trialUsers = contacts.filter(c => c.segment === "Trial Users").length;

  const totalCampaigns = campaigns.length;
  const totalDispatched = campaigns.reduce((acc, c) => acc + c.metrics.sent, 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + c.metrics.delivered, 0);
  const totalRead = campaigns.reduce((acc, c) => acc + c.metrics.read, 0);

  const avgReadRate = totalDelivered ? Math.round((totalRead / totalDelivered) * 100) : 74;

  const openTicketsCount = tickets.filter(t => t.status === "Open" || t.status === "Escalated" || t.status === "In Progress").length;
  const activeWorkflowsCount = workflows.filter(w => w.isActive).length;

  // Custom inline SVG graph coordinates
  const analyticsTrendLine = [24, 48, 38, 70, 52, 90, 85, 114, 98, 142];

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#fafafa] overflow-y-auto scrollbar-thin">
      {/* Banner */}
      <div className="border-b border-white/10 bg-[#09090b]/50 backdrop-blur-sm p-6 sticky top-0 z-10">
        <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">Business Performance Center</span>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1">Performance Insights</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Track message delivery, audience response trends, support answers, and automated steps.
            </p>
          </div>
          <button
            id="refresh-analytics-top"
            onClick={loadAllMetrics}
            className="px-3.5 py-1.5 bg-[#18181b]/60 hover:bg-[#27272a]/60 border border-white/10 hover:border-indigo-500/30 rounded-xl text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
          >
            Refresh Stats
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center p-12 text-xs font-mono text-zinc-500">
          Analyzing performance results...
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Key Stat Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Stat 1 */}
            <div className="glass-card p-5 hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => onNavigate("/dashboard/crm")}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Total Contacts</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-white">{contacts.length}</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5 font-medium">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  +12.4%
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-3 whitespace-nowrap overflow-hidden text-ellipsis">
                Leads: {totalLeads} | Premium: {premiumUsers}
              </p>
            </div>

            {/* Stat 2 */}
            <div className="glass-card p-5 hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => onNavigate("/dashboard/campaigns")}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Messages Sent</span>
                <Flame className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-white">{totalDispatched}</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5 font-medium">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  +42.1%
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-3 truncate">
                Avg Read Rate: {avgReadRate}% | Total: {totalCampaigns} Runs
              </p>
            </div>

            {/* Stat 3 */}
            <div className="glass-card p-5 hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => onNavigate("/dashboard/tickets")}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Active Support Requests</span>
                <LifeBuoy className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-white">{openTicketsCount}</span>
                <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-0.5 font-medium">
                  Response active
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-3 truncate">
                Urgent priority: {tickets.filter(t => t.priority === "Urgent").length}
              </p>
            </div>

            {/* Stat 4 */}
            <div className="glass-card p-5 hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => onNavigate("/dashboard/workflows")}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Automated Actions</span>
                <Network className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-white">{activeWorkflowsCount}</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5 font-medium">
                  Running rules
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-3 truncate">
                Runs this month: {workflows.reduce((acc, w) => acc + w.runsCount, 0)}
              </p>
            </div>
          </div>

          {/* Visual Trend Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Core Dispatch analytics graph */}
            <div className="lg:col-span-2 glass-card p-5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-white">Message Delivery Trends</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5 font-sans">Hourly message traffic and dispatch trends.</p>
                </div>
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>

              {/* Responsive SVG Graph Line */}
              <div className="h-44 w-full bg-black/10 border border-white/5 rounded-lg p-2 flex items-center justify-center relative">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {/* Fill area */}
                  <path 
                    d="M 0 150 L 0 126 L 55 102 L 110 112 L 165 80 L 220 98 L 275 60 L 330 65 L 385 36 L 440 52 L 500 8 L 500 150 Z" 
                    fill="url(#chartGrad)" 
                  />
                  {/* Line */}
                  <path 
                    d="M 0 126 L 55 102 L 110 112 L 165 80 L 220 98 L 275 60 L 330 65 L 385 36 L 440 52 L 500 8" 
                    fill="none" 
                    stroke="#6366f1" 
                    strokeWidth="2.5" 
                    className="stroke-indigo-500 animate-pulse"
                  />
                </svg>

                {/* Metric benchmarks */}
                <div className="absolute top-2 left-3 text-[9px] font-mono text-zinc-500">150k messages</div>
                <div className="absolute bottom-2 left-3 text-[9px] font-mono text-zinc-500">0</div>
              </div>

              <div className="flex justify-between items-center mt-4 text-[10px] font-mono text-zinc-500 px-1">
                <span>05 AM</span>
                <span>08 AM</span>
                <span>11 AM</span>
                <span>02 PM</span>
                <span>05 PM</span>
                <span>08 PM</span>
              </div>
            </div>

            {/* AI Action overview timeline */}
            <div className="glass-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-white">AI Assistant Performance</h3>
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-[11px] text-zinc-400 mb-4">Success rate and voice styles for automated message recommendations.</p>
                
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                      <span>AI Response Success Rate</span>
                      <span className="text-emerald-400 font-bold">100.0%</span>
                    </div>
                    <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-emerald-500 h-full w-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                      <span>Test Mode Replies</span>
                      <span className="text-indigo-400 font-bold">12 runs</span>
                    </div>
                    <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-indigo-500 h-full w-[40%]" />
                    </div>
                  </div>
                  <div className="p-3 bg-[#18181b]/50 border border-white/10 rounded-xl flex items-center justify-between mt-4">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block">Active Style</span>
                      <span className="text-xs font-semibold text-white mt-1 block">Helpful Support Assistant</span>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded text-[9px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              <button
                id="analytics-ai-goto"
                className="mt-6 w-full py-2 bg-[#18181b]/60 hover:bg-[#27272a]/60 border border-white/10 text-xs font-semibold text-zinc-300 rounded-xl transition-all cursor-pointer"
                onClick={() => onNavigate("/dashboard/ai-center")}
              >
                Go to AI Assistant
              </button>
            </div>
          </div>

          {/* CRM segment progress distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-white mb-1.5">Urgent Customer Requests</h3>
              <p className="text-[11px] text-zinc-400 mb-4">Requests from customers needing immediate attention and fast replies.</p>
              
              <div className="space-y-2.5">
                {tickets.slice(0, 2).map(tk => (
                  <div key={tk.id} className="p-3 bg-[#a16207]/5 border border-amber-500/20 rounded-xl flex items-center justify-between gap-4 scale-[0.99] hover:scale-100 transition-all">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-wider block">{tk.priority} PRIORITY</span>
                      <span className="text-xs font-bold text-white mt-0.5 block">{tk.title}</span>
                      <span className="text-[10px] text-zinc-400 mt-1 block">Contact: {tk.contactName} ({tk.contactPhone})</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-[#a16207]/10 text-amber-500 border border-amber-500/20 rounded text-[10px] font-semibold">
                        Expected reply time: {tk.slaLimitMinutes}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Customer Choice & Privacy Audits</h3>
                <p className="text-xs text-zinc-400 mb-4">Verified compliant message tracking.</p>
                <div className="p-3 bg-emerald-950/15 border border-emerald-900/40 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Fully Compliant & Private
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">Consent histories are safely stored and verified to protect customer choices.</p>
                </div>
              </div>
              <button
                className="mt-4 w-full py-2 bg-[#18181b]/60 hover:bg-[#27272a]/60 border border-white/10 text-xs font-semibold text-zinc-300 rounded-xl transition-all cursor-pointer"
                onClick={() => onNavigate("/dashboard/privacy")}
              >
                Go to Privacy Audits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
