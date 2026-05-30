/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Campaign, CampaignTemplate, CampaignChannel, CampaignStatus, User } from "../types";
import { 
  Megaphone, Plus, Copy, FileText, Send, Calendar, CheckSquare, 
  BarChart2, Play, Users, MessageSquareCode, ShieldCheck, Mail
} from "lucide-react";

interface CampaignModuleProps {
  user: User;
}

export default function CampaignModule({ user }: CampaignModuleProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<"runs" | "templates">("runs");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [formName, setFormName] = useState("");
  const [formChannel, setFormChannel] = useState<CampaignChannel>(CampaignChannel.WHATSAPP);
  const [formSegment, setFormSegment] = useState("Leads");
  const [formTemplateId, setFormTemplateId] = useState("");
  const [formScheduled, setFormScheduled] = useState("");

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const campRes = await fetch("/api/campaigns");
      const campData = await campRes.json();
      setCampaigns(campData.campaigns || []);

      const tplRes = await fetch("/api/templates");
      const tplData = await tplRes.json();
      setTemplates(tplData.templates || []);
      
      if (tplData.templates?.length > 0 && !formTemplateId) {
        setFormTemplateId(tplData.templates[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formTemplateId) return;

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          channel: formChannel,
          targetSegment: formSegment,
          templateId: formTemplateId,
          scheduledTime: formScheduled || undefined
        })
      });

      if (res.ok) {
        setIsCreatingCampaign(false);
        setFormName("");
        setFormScheduled("");
        // Reload after quick simulated progress
        setTimeout(() => {
          loadData();
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch("/api/campaigns/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedTemplateContent = templates.find(t => t.id === formTemplateId)?.content || "No template selected";

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#fafafa] font-sans">
      {/* Banner */}
      <div className="flex justify-between items-center border-b border-white/10 bg-[#09090b]/50 backdrop-blur-sm p-6 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <span>Campaign Outbox Center</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Build and monitor opt-in campaigns exclusively over Bulk SMS and WhatsApp, synchronized securely with Meta APIs.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="refresh-campaigns-btn"
            onClick={loadData}
            disabled={isRefreshing}
            className="p-1.5 px-3 bg-[#18181b]/60 hover:bg-[#27272a]/60 border border-white/10 hover:border-indigo-500/30 text-zinc-300 rounded-lg text-xs font-medium cursor-pointer transition-all"
          >
            {isRefreshing ? "Refreshing state..." : "Verify Pipeline Metrics"}
          </button>
          <button
            id="create-broadcast-btn"
            onClick={() => { setIsCreatingCampaign(true); setWizardStep(1); }}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/15"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Outbound Broadcast</span>
          </button>
        </div>
      </div>

      {/* Local Tabs selector */}
      <div className="px-6 border-b border-white/10 bg-[#09090b]/20 backdrop-blur-xs">
        <div className="flex gap-4">
          <button
            id="campaign-tab-runs"
            onClick={() => setActiveTab("runs")}
            className={`py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "runs" ? "border-indigo-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-350"
            }`}
          >
            Outbound Campaign Runs ({campaigns.length})
          </button>
          <button
            id="campaign-tab-templates"
            onClick={() => setActiveTab("templates")}
            className={`py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "templates" ? "border-indigo-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-350"
            }`}
          >
            Pre-registered Approved Templates ({templates.length})
          </button>
        </div>
      </div>

      {/* Module Content */}
      <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
        {activeTab === "runs" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#18181b]/35 border border-white/10 rounded-xl p-4">
                <div className="text-[10px] font-mono uppercase text-zinc-500">Scheduled Actions</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {campaigns.filter(c => c.status === CampaignStatus.SCHEDULED).length}
                </div>
              </div>
              <div className="bg-[#18181b]/35 border border-white/10 rounded-xl p-4">
                <div className="text-[10px] font-mono uppercase text-indigo-400">Active Sequences</div>
                <div className="text-2xl font-bold text-indigo-400 mt-1">
                  {campaigns.filter(c => c.status === CampaignStatus.ACTIVE).length}
                </div>
              </div>
              <div className="bg-[#18181b]/35 border border-white/10 rounded-xl p-4">
                <div className="text-[10px] font-mono uppercase text-emerald-400">Completed Batches</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {campaigns.filter(c => c.status === CampaignStatus.COMPLETED).length}
                </div>
              </div>
              <div className="bg-[#18181b]/35 border border-white/10 rounded-xl p-4">
                <div className="text-[10px] font-mono uppercase text-red-500">Failure Outages</div>
                <div className="text-2xl font-bold text-red-400 mt-1">
                  {campaigns.filter(c => c.status === CampaignStatus.FAILED).length}
                </div>
              </div>
            </div>

            {/* Campaign lists */}
            <div className="space-y-4">
              {campaigns.map((camp) => {
                const totalSent = camp.metrics.sent;
                const deliveryRate = totalSent ? Math.round((camp.metrics.delivered / totalSent) * 100) : 0;
                const readRate = camp.metrics.delivered ? Math.round((camp.metrics.read / camp.metrics.delivered) * 100) : 0;
                
                return (
                  <div key={camp.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all">
                    {/* Left stats */}
                    <div className="space-y-1.5 flex-1 min-w-[240px]">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                          camp.channel === CampaignChannel.WHATSAPP 
                            ? "bg-emerald-950/30 border border-emerald-800/50 text-emerald-400"
                            : "bg-indigo-950/30 border border-indigo-805/50 text-indigo-400"
                        }`}>
                          {camp.channel}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                          camp.status === CampaignStatus.COMPLETED 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : camp.status === CampaignStatus.ACTIVE
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse"
                            : camp.status === CampaignStatus.SCHEDULED
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border border-white/5"
                        }`}>
                          {camp.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mt-1">{camp.name}</h3>
                      <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Segment: {camp.targetSegment}</span>
                        </div>
                        {camp.scheduledTime && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Scheduled: {new Date(camp.scheduledTime).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Performance metrics charts/bars */}
                    <div className="flex gap-4 shrink-0 flex-wrap sm:flex-nowrap">
                      <div className="text-center bg-white/[0.02] p-2.5 rounded-lg border border-white/5 min-w-[70px]">
                        <div className="text-[9px] font-mono text-zinc-500 uppercase">Dispatched</div>
                        <div className="text-sm font-bold text-white mt-0.5">{camp.metrics.sent}</div>
                      </div>
                      <div className="text-center bg-white/[0.02] p-2.5 rounded-lg border border-white/5 min-w-[70px]">
                        <div className="text-[9px] font-mono text-zinc-500 uppercase">Delivered</div>
                        <div className="text-sm font-bold text-white mt-0.5">{deliveryRate}%</div>
                      </div>
                      <div className="text-center bg-white/[0.02] p-2.5 rounded-lg border border-white/5 min-w-[70px]">
                        <div className="text-[9px] font-mono text-zinc-500 uppercase">Read Rate</div>
                        <div className="text-sm font-bold text-white mt-0.5">{readRate}%</div>
                      </div>
                      <div className="text-center bg-white/[0.02] p-2.5 rounded-lg border border-white/5 min-w-[70px]">
                        <div className="text-[9px] font-mono text-zinc-500 uppercase">Replies</div>
                        <div className="text-sm font-bold text-indigo-400 mt-0.5">{camp.metrics.replied}</div>
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        id={`duplicate-camp-${camp.id}`}
                        onClick={() => handleDuplicate(camp.id)}
                        className="p-1 px-2 text-[10px] bg-[#18181b]/60 hover:bg-[#27272a]/60 hover:text-white border border-white/10 hover:border-indigo-500/30 rounded-md transition-all flex items-center gap-1 text-zinc-400 cursor-pointer"
                        title="Duplicate Campaign"
                      >
                        <Copy className="w-3" />
                        <span>Clone</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <div key={tpl.id} className="glass-card p-5 hover:border-white/20 transition-all flex flex-col justify-between h-48">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquareCode className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-semibold text-white">{tpl.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                        tpl.channel === CampaignChannel.WHATSAPP 
                          ? "bg-emerald-950/30 border border-emerald-800/50 text-emerald-400"
                          : "bg-indigo-950/30 border border-indigo-805/50 text-indigo-400"
                      }`}>
                        {tpl.channel}
                      </span>
                    </div>
                    <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5 text-xs font-mono text-zinc-400 leading-relaxed overflow-hidden text-ellipsis line-clamp-3">
                      {tpl.content}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Approved (Meta/Operator cleared)
                    </span>
                    <span>ID: {tpl.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Campaign Scheduling Drawer Modal */}
      {isCreatingCampaign && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
          <div className="w-full max-w-md bg-[#0c0c0e] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-indigo-400" />
                <span>Create Bulk Announcement</span>
              </h3>
              <button
                onClick={() => setIsCreatingCampaign(false)}
                className="text-[10px] text-zinc-500 hover:text-white cursor-pointer px-1.5 py-0.5 rounded border border-white/5 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>

            {/* Wizard Steps indicator */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5 text-[10px] font-mono tracking-wider text-zinc-500">
              <span className={wizardStep === 1 ? "text-indigo-400 font-bold" : "text-zinc-650"}>1. Audience</span>
              <span className="text-zinc-700">/</span>
              <span className={wizardStep === 2 ? "text-indigo-400 font-bold" : "text-zinc-650"}>2. Message</span>
              <span className="text-zinc-700">/</span>
              <span className={wizardStep === 3 ? "text-indigo-400 font-bold" : "text-zinc-650"}>3. Preview</span>
              <span className="text-zinc-700">/</span>
              <span className={wizardStep === 4 ? "text-indigo-400 font-bold" : "text-zinc-650"}>4. Schedule</span>
            </div>

            {/* STEP 1: CHOOSE AUDIENCE */}
            {wizardStep === 1 && (
              <div className="space-y-4 font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                    What is this campaign called?
                  </label>
                  <input
                    id="camp-form-name"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Festival Season Welcome Alert"
                    className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                      Target Audience
                    </label>
                    <select
                      id="camp-form-segment"
                      value={formSegment}
                      onChange={(e) => setFormSegment(e.target.value)}
                      className="w-full px-2 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none cursor-pointer focus:border-indigo-500/50"
                    >
                      <option value="Leads">Leads & Prospects</option>
                      <option value="Premium Users">Premium Customers</option>
                      <option value="Inactive Users">Inactive Lists (Re-engage)</option>
                      <option value="Trial Users">Free Trial Subscribers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                      Choose Channel
                    </label>
                    <select
                      id="camp-form-channel"
                      value={formChannel}
                      onChange={(e) => setFormChannel(e.target.value as CampaignChannel)}
                      className="w-full px-2 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none cursor-pointer focus:border-indigo-500/50"
                    >
                      <option value={CampaignChannel.WHATSAPP}>WhatsApp Verified</option>
                      <option value={CampaignChannel.SMS}>Bulk SMS Network</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!formName.trim()}
                  onClick={() => setWizardStep(2)}
                  className="w-full mt-4 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg text-xs font-semibold text-white tracking-wide transition-all cursor-pointer shadow-lg shadow-indigo-500/15"
                >
                  Next: Choose Message Template
                </button>
              </div>
            )}

            {/* STEP 2: WRITE MESSAGE / SELECT TEMPLATE */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                    Select approved message template
                  </label>
                  <select
                    id="camp-form-template"
                    value={formTemplateId}
                    onChange={(e) => setFormTemplateId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none cursor-pointer focus:border-indigo-500/50 mb-3"
                  >
                    {templates.filter(t => t.channel === formChannel).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    {templates.filter(t => t.channel === formChannel).length === 0 && (
                      <option value="">No templates registered for this channel.</option>
                    )}
                  </select>

                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-sans text-zinc-400">
                    <span className="text-[9px] font-mono uppercase text-indigo-400 tracking-wider block mb-1">Original Text Structure</span>
                    <p className="italic">"{selectedTemplateContent}"</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="flex-1 py-2 px-3 bg-[#18181b] border border-white/10 hover:bg-white/5 rounded-lg text-xs font-semibold text-zinc-300 cursor-pointer transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!formTemplateId}
                    onClick={() => setWizardStep(3)}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-45 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all shadow-md shadow-indigo-500/15"
                  >
                    Next: Preview Message
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PREVIEW CAMPAIGN */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                    Live customer view simulation (e.g. Rajesh Kumar)
                  </span>
                  
                  {/* Whatsapp Bubble Simulation view */}
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl font-sans">
                    <div className="max-w-[85%] bg-indigo-950/40 border border-indigo-900/30 rounded-2xl rounded-bl-none p-3.5 text-xs text-[#fafafa] shadow">
                      <div className="text-[10px] font-mono text-zinc-500 font-semibold mb-1 uppercase tracking-wider">
                        {formChannel === CampaignChannel.WHATSAPP ? "WhatsApp Verification Service" : "SMS Operator Relay"}
                      </div>
                      <p className="leading-relaxed">
                        {selectedTemplateContent.replace("{{name}}", "Rajesh Kumar")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="flex-1 py-2 px-3 bg-[#18181b] border border-white/10 hover:bg-white/5 rounded-lg text-xs font-semibold text-zinc-300 cursor-pointer transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all shadow-md shadow-indigo-500/15"
                  >
                    Next: Schedule Or Send
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SCHEDULE OR SEND */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                    When should we deliver this checklist? (Leave empty for Immediate dispatch)
                  </label>
                  <input
                    id="camp-form-scheduled"
                    type="datetime-local"
                    value={formScheduled}
                    onChange={(e) => setFormScheduled(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none font-mono focus:border-indigo-500/50 mb-4"
                  />

                  <div className="p-3.5 bg-indigo-950/20 border border-indigo-900/20 rounded-xl space-y-1.5 font-sans">
                    <h4 className="text-xs font-bold text-indigo-400">Ready to deploy?</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      You are about to queue or broadcast standard announcements to the <strong className="text-white">{formSegment}</strong> contacts list over <strong className="text-white">{formChannel}</strong> template protocols.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="flex-1 py-2 px-3 bg-[#18181b] border border-[#27272a] hover:bg-white/5 rounded-lg text-xs font-semibold text-zinc-300 cursor-pointer transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateCampaign}
                    className="flex-grow-[1.5] py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all shadow-lg shadow-indigo-500/15 uppercase tracking-wider"
                  >
                    {formScheduled ? "Schedule Broadcast" : "Send immediately"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
