/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CustomizedAction } from "./workflowTypes";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { TrendingUp, Users, CheckCircle2, ShieldAlert, Zap, Layers } from "lucide-react";

interface ActionAnalyticsProps {
  action: CustomizedAction;
}

export default function ActionAnalytics({ action }: ActionAnalyticsProps) {
  // Simple fake history chart points
  const performanceTrendData = [
    { name: "Mon", runs: Math.round(action.metrics.runsCompleted * 0.15), resolved: Math.round(action.metrics.runsCompleted * 0.12) },
    { name: "Tue", runs: Math.round(action.metrics.runsCompleted * 0.28), resolved: Math.round(action.metrics.runsCompleted * 0.22) },
    { name: "Wed", runs: Math.round(action.metrics.runsCompleted * 0.42), resolved: Math.round(action.metrics.runsCompleted * 0.35) },
    { name: "Thu", runs: Math.round(action.metrics.runsCompleted * 0.65), resolved: Math.round(action.metrics.runsCompleted * 0.55) },
    { name: "Fri", runs: Math.round(action.metrics.runsCompleted * 0.82), resolved: Math.round(action.metrics.runsCompleted * 0.70) },
    { name: "Sat", runs: Math.round(action.metrics.runsCompleted * 0.95), resolved: Math.round(action.metrics.runsCompleted * 0.82) },
    { name: "Sun", runs: action.metrics.runsCompleted, resolved: Math.round(action.metrics.runsCompleted * (action.metrics.completionRate / 100)) }
  ];

  return (
    <div className="space-y-6">
      {/* 4 Scorecards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Runs completed */}
        <div className="bg-[#18181b]/35 border border-white/5 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">Completed Runs</span>
            <div className="p-1 px-1.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono text-[9px] border border-indigo-500/20">
              Active Log
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-sans">{action.metrics.runsCompleted}</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">+12% vs past week</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-normal">Total automated action workflows initiated this billing week.</p>
        </div>

        {/* Customer Engagement rate */}
        <div className="bg-[#18181b]/35 border border-white/5 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">Engagement Rate</span>
            <Zap className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-sans">{action.metrics.engagementRate}%</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">Stable</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-normal">Percentage of target audience replying to WhatsApp/SMS drafts.</p>
        </div>

        {/* AI Resolution Index */}
        <div className="bg-[#18181b]/35 border border-white/5 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">AI Resolution</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-sans">{action.metrics.aiResolutionRate}%</span>
            <span className="text-[10px] text-indigo-400 font-mono font-bold">Optimized</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-normal">Inbox queries completely answered by AI triggers with no human help.</p>
        </div>

        {/* Urgent Human escalation count */}
        <div className="bg-[#18181b]/35 border border-white/5 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold">Escalation Triggers</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-sans">{action.metrics.humanSupportRequests}</span>
            <span className="text-[10px] text-amber-500 font-mono font-bold">-4 Churn risk</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-normal">Urgent tasks routed for active support coordinator review.</p>
        </div>
      </div>

      {/* Analytics Charts Area */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance timeline Progression */}
        <div className="lg:col-span-8 space-y-3.5">
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Activity History Analytics</span>
            </h3>
            <p className="text-[11px] text-zinc-550">Runs triggered and completed successfully across the past 7 days</p>
          </div>

          <div className="h-[210px] w-full text-zinc-300">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrendData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "12px", fontSize: "11px" }}
                  labelClassName="text-white font-mono"
                />
                <Line type="monotone" dataKey="runs" name="Runs Started" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved Successfully" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel chart summary metrics */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono tracking-wider font-bold text-purple-400 uppercase">Fulfillment Funnel</span>
            <h4 className="text-xs font-bold text-white">Action Completion Index: {action.metrics.completionRate}%</h4>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Calculates the total percentage of clients who reach completion without encountering blockages or card failure exceptions.
            </p>
          </div>

          {/* Connected step metric details */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-medium">Starts Triggered:</span>
              <span className="text-white font-bold">{action.metrics.runsCompleted}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-medium">Interactions Qualified:</span>
              <span className="text-white font-bold">{Math.round(action.metrics.runsCompleted * (action.metrics.engagementRate / 100))}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-medium font-semibold text-indigo-405">Completed Automatically:</span>
              <span className="text-emerald-400 font-bold">{Math.round(action.metrics.runsCompleted * (action.metrics.completionRate / 100))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
