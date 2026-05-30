/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User } from "../types";
import { 
  Settings, Building, MessageSquareCode, PhoneOutgoing, ShieldAlert, 
  CheckSquare, History, Key, CheckCircle, Smartphone, Users, Bell, 
  Shield, CreditCard, Plus, Trash2, Mail, Check, AlertCircle
} from "lucide-react";

interface SettingsModuleProps {
  user: User;
}

export default function SettingsModule({ user }: SettingsModuleProps) {
  const [org, setOrg] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Tabs state
  const [activeSubTab, setActiveSubTab] = useState<"workspace" | "channels" | "team" | "notifications" | "privacy" | "billing">("workspace");

  // State values for Workspace
  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgEmail, setOrgEmail] = useState("");

  // State values for Connected Channels
  const [whatsappBusinessId, setWhatsappBusinessId] = useState("");
  const [whatsappPhoneId, setWhatsappPhoneId] = useState("");

  // State values for Notifications toggles
  const [notifSupport, setNotifSupport] = useState(true);
  const [notifCompleted, setNotifCompleted] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false);

  // State values for Team invites
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Agent");
  const [teamMembers, setTeamMembers] = useState([
    { id: "1", name: "Anish Roy", email: "anish.roy@acme-business.com", role: "Owner", active: true },
    { id: "2", name: "Rajesh Kumar", email: "rajesh@acme-business.com", role: "Manager", active: true },
    { id: "3", name: "Simran Kaur", email: "simran@acme-business.com", role: "Agent", active: true },
  ]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/organization/settings");
      const data = await res.json();
      if (data.organization) {
        setOrg(data.organization);
        setOrgName(data.organization.name);
        setOrgDomain(data.organization.domain || "SaaS Technology");
        setOrgPhone(data.organization.phone || "");
        setOrgEmail(data.organization.email || "");
        setWhatsappBusinessId(data.organization.whatsappBusinessId || "");
        setWhatsappPhoneId(data.organization.whatsappPhoneId || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedObj = {
        name: orgName,
        domain: orgDomain,
        phone: orgPhone,
        email: orgEmail,
        whatsappBusinessId,
        whatsappPhoneId
      };

      const res = await fetch("/api/organization/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedObj)
      });
      const data = await res.json();
      if (data.organization) {
        setOrg(data.organization);
        alert("Workspace profile information and connected channel details successfully updated!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    const namePart = newMemberEmail.split("@")[0];
    const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    setTeamMembers(prev => [
      ...prev,
      {
        id: "member-" + Date.now(),
        name: capitalizedName,
        email: newMemberEmail,
        role: newMemberRole,
        active: false // pending invite status
      }
    ]);
    setNewMemberEmail("");
    alert(`Success! Invitation sent to ${newMemberEmail}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#fafafa] font-sans">
      {/* Banner */}
      <div className="border-b border-white/10 bg-[#09090b]/50 backdrop-blur-sm p-6 sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>Workspace Settings</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Customize active business profiles, manage role structures, toggle notifications, configure channels, and view invoices.
        </p>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center p-12 text-xs font-mono text-zinc-500">
          Syncing local credential registers...
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main settings interactive body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            
            {/* Quick settings menu bar tabs */}
            <div className="flex flex-wrap gap-1 bg-[#18181b]/40 border border-white/10 p-0.5 rounded-xl">
              <button
                id="settings-subtab-workspace"
                onClick={() => setActiveSubTab("workspace")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSubTab === "workspace" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Workspace</span>
              </button>
              <button
                id="settings-subtab-channels"
                onClick={() => setActiveSubTab("channels")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSubTab === "channels" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span>Connected Channels</span>
              </button>
              <button
                id="settings-subtab-team"
                onClick={() => setActiveSubTab("team")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSubTab === "team" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team</span>
              </button>
              <button
                id="settings-subtab-notifications"
                onClick={() => setActiveSubTab("notifications")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSubTab === "notifications" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notifications</span>
              </button>
              <button
                id="settings-subtab-privacy"
                onClick={() => setActiveSubTab("privacy")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSubTab === "privacy" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Privacy</span>
              </button>
              <button
                id="settings-subtab-billing"
                onClick={() => setActiveSubTab("billing")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                  activeSubTab === "billing" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Billing</span>
              </button>
            </div>

            {/* TAB CONTENT: WORKSPACE */}
            {activeSubTab === "workspace" && (
              <form onSubmit={handleSaveSettings} className="glass-card p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Business profile</h3>
                    <p className="text-[11px] text-zinc-550 mt-0.5">Customize basic identifier endpoints shared on header banners.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                      Business name
                    </label>
                    <input
                      id="settings-org-name"
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Acme Corp India"
                      className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                      Business Domain / Sector
                    </label>
                    <select
                      id="settings-org-domain"
                      value={orgDomain}
                      onChange={(e) => setOrgDomain(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none cursor-pointer focus:border-indigo-500/50 font-sans"
                    >
                      <option value="SaaS Technology">SaaS & Software</option>
                      <option value="E-Commerce Retail">E-Commerce Retailing</option>
                      <option value="Healthcare Care">Healthcare & Medical</option>
                      <option value="FinTech Finance">FinTech / Finance</option>
                      <option value="EdTech Education">Education & Training</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 col-span-2">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                      Support email
                    </label>
                    <input
                      id="settings-org-email"
                      type="email"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      placeholder="support@acme-business.com"
                      className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                      Operational phone fallback
                    </label>
                    <input
                      id="settings-org-phone"
                      type="tel"
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                      placeholder="+918023456789"
                      className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none font-sans focus:border-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="save-settings-btn"
                    type="submit"
                    disabled={isSaving}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-500/15"
                  >
                    {isSaving ? "Saving style changes..." : "Save Workspace Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: CONNECTED CHANNELS */}
            {activeSubTab === "channels" && (
              <form onSubmit={handleSaveSettings} className="glass-card p-6 space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Channel Configurations</h3>
                  <p className="text-[11px] text-zinc-550 mt-0.5">Define WhatsApp ID structures and check API webhook connectivity endpoints safely.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                      Meta WhatsApp Account ID (WABA)
                    </label>
                    <input
                      id="settings-waba-id"
                      type="text"
                      value={whatsappBusinessId}
                      onChange={(e) => setWhatsappBusinessId(e.target.value)}
                      placeholder="waba_acme_283749"
                      className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none font-mono focus:border-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                      WhatsApp Verified Phone ID
                    </label>
                    <input
                      id="settings-phone-id"
                      type="text"
                      value={whatsappPhoneId}
                      onChange={(e) => setWhatsappPhoneId(e.target.value)}
                      placeholder="ph_id_acme_483921"
                      className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none font-mono focus:border-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-950/20 border border-indigo-900/25 rounded-xl text-xs flex gap-2 pt-3">
                  <Key className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-indigo-400 uppercase tracking-wider text-[9px]">API & WEBHOOK SECURITY</div>
                    <p className="text-[11px] text-zinc-350 leading-relaxed mt-1">Webhook endpoint URL: <span className="font-mono bg-black/25 px-1 py-0.5 rounded text-indigo-300">https://api.business.com/v1/webhook</span></p>
                    <p className="text-[10px] text-zinc-450 mt-0.5">Handshake token: <span className="font-mono bg-black/25 px-1 py-0.5 rounded text-indigo-300">wh_verified_token_7194</span></p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="save-settings-btn-channels"
                    type="submit"
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-500/15"
                  >
                    Save Channel Details
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: TEAM MEMBERS */}
            {activeSubTab === "team" && (
              <div className="space-y-4">
                <form onSubmit={handleInviteTeamMember} className="glass-card p-6 space-y-4">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Invite Team Members</h3>
                    <p className="text-[11px] text-zinc-550 mt-0.5">Let team agents answer support requests, launch campaigns, or view statistics.</p>
                  </div>

                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                        Invitee Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="coop@acme-business.com"
                        className="w-full px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                        Workspace Role
                      </label>
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="px-3 py-2 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none cursor-pointer focus:border-indigo-500/50 font-sans"
                      >
                        <option value="Owner">Workspace Owner (Full Access)</option>
                        <option value="Manager">Manager (Actions & Campaign)</option>
                        <option value="Agent">Customer Agent (Support Desk)</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer text-nowrap h-9 shadow-md shadow-indigo-500/15"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Send Invite</span>
                    </button>
                  </div>
                </form>

                <div className="glass-card overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-mono uppercase tracking-wider text-zinc-550">
                        <th className="p-3.5">Name</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {teamMembers.map(m => (
                        <tr key={m.id} className="hover:bg-white/[0.01]">
                          <td className="p-3.5 text-zinc-100 font-semibold">{m.name}</td>
                          <td className="p-3.5 text-zinc-400 font-mono text-[11px]">{m.email}</td>
                          <td className="p-3.5">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-850 border border-white/5 text-zinc-300 font-medium text-[10px]">
                              {m.role}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {m.active ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                ACTIVE
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold">
                                INVITED
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: NOTIFICATIONS */}
            {activeSubTab === "notifications" && (
              <div className="glass-card p-6 space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Email Alert Settings</h2>
                  <p className="text-[11px] text-zinc-550 mt-0.5">Toggle what system notifications are delivered to the registered support email address.</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group text-zinc-300 select-none">
                    <input
                      type="checkbox"
                      checked={notifSupport}
                      onChange={(e) => setNotifSupport(e.target.checked)}
                      className="mt-1 accent-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold group-hover:text-white transition-colors">Immediate Support Alerts</span>
                      <p className="text-[11px] text-zinc-550 mt-0.5">Email the team inbox when urgent customer queries or reminders breach attention timelines.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group text-zinc-300 select-none">
                    <input
                      type="checkbox"
                      checked={notifCompleted}
                      onChange={(e) => setNotifCompleted(e.target.checked)}
                      className="mt-1 accent-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold group-hover:text-white transition-colors">Campaign Completion Summaries</span>
                      <p className="text-[11px] text-zinc-550 mt-0.5">Deliver a performance report with deliverability speeds and read percentages as soon as campaign runs complete.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group text-zinc-300 select-none">
                    <input
                      type="checkbox"
                      checked={notifWeeklyDigest}
                      onChange={(e) => setNotifWeeklyDigest(e.target.checked)}
                      className="mt-1 accent-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold group-hover:text-white transition-colors">Daily AI Growth Report</span>
                      <p className="text-[11px] text-zinc-550 mt-0.5">Receive intelligent recommendations about how customer experience ratings are improving based on smart summaries.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => alert("Notification settings applied!")}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-500/15"
                  >
                    Apply Alert Rules
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PRIVACY */}
            {activeSubTab === "privacy" && (
              <div className="glass-card p-6 space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Privacy & Compliance Policies</h2>
                  <p className="text-[11px] text-zinc-550 mt-0.5">Monitor and configure user opt-in/opt-out mandates and compliant message tracking guidelines.</p>
                </div>

                <div className="space-y-4 font-sans text-xs text-zinc-350 leading-relaxed block">
                  <p>
                    All outgoing communication is audited for consent records to comply with international regulations (GDPR, India DPDP, and TCPA).
                  </p>
                  
                  <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-2xl p-4 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400">Message Opt-Out Active</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">If a customer replies with "STOP" or "UNSUBSCRIBE," our system automatically labels them as unsubscribed and blocks outbound message threads to protect player preference.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => alert("Consent system settings are locked to maximum compliance standards.")}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-500/15"
                  >
                    Manage Consent Headers
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: BILLING */}
            {activeSubTab === "billing" && (
              <div className="space-y-4">
                <div className="glass-card p-6 flex flex-col justify-between h-48 relative overflow-hidden bg-gradient-to-br from-[#18181b] to-zinc-950">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <CreditCard className="w-40 h-40 text-white" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-md uppercase font-mono tracking-wider">ACTIVE SUBSCRIPTION</span>
                    <h3 className="text-lg font-bold text-white mt-1.5 font-sans">Growth Workspace Plan</h3>
                    <p className="text-xs text-zinc-400 mt-1">Renewing automatically for <strong className="text-white">$49.00 / month</strong> on June 15, 2026.</p>
                  </div>

                  <div className="flex gap-6 items-center border-t border-white/5 pt-4">
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider">AI Usage limits</span>
                      <div className="text-xs font-semibold text-white mt-1">2,410 of 10,005 credits used</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-zinc-500 font-mono tracking-wider">Contacts allowed</span>
                      <div className="text-xs font-semibold text-white mt-1">1,500 CRM Contacts Limit</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Historic Invoice Receipts</h3>
                  
                  <div className="divide-y divide-white/5 font-sans text-xs text-zinc-300">
                    <div className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold block font-mono">Invoice #OMNI-0294</span>
                        <span className="text-[10px] text-zinc-550 block">Paid on May 15, 2026 with Card ending in 4242</span>
                      </div>
                      <span className="font-bold text-white">$49.00 USD</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold block font-mono">Invoice #OMNI-0182</span>
                        <span className="text-[10px] text-zinc-550 block">Paid on April 15, 2026 with Card ending in 4242</span>
                      </div>
                      <span className="font-bold text-white">$49.00 USD</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right sidebar tracking audits */}
          <div className="w-full lg:w-80 shrink-0 bg-[#09090b]/35 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-96 lg:h-auto overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/[0.01]/40 flex items-center gap-1.5 shrink-0">
              <History className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Operations Audit Trail</span>
            </div>

            <div className="flex-1 p-4 space-y-3.5 overflow-y-auto scrollbar-thin">
              {org?.logs && org.logs.map((item: any, index: number) => (
                <div key={index} className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl space-y-1 hover:border-zinc-800 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-zinc-100 font-mono truncate">{item.user}</span>
                    <span className="px-1 px-1.5 bg-[#18181b] border border-white/5 text-zinc-400 text-[9px] font-mono shrink-0 uppercase">
                      Update
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 italic">"{item.action}"</p>
                  <div className="text-[9px] font-mono text-zinc-650 text-right">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {(!org?.logs || org.logs.length === 0) && (
                <div className="text-center py-12 text-xs text-zinc-500 italic font-mono">
                  No adjustments performed.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// Simple shield helper icon missing in import but simulated
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 text-emerald-400 shrink-0"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l7-2a1 1 0 0 1 .48 0l7 2A1 1 0 0 1 20 6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
