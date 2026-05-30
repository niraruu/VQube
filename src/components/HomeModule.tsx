/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Contact, Campaign, CampaignStatus } from "../types";
import { 
  Sparkles, Users, Megaphone, HelpCircle, ArrowRight, Play, 
  CheckCircle2, Circle, Settings, ShieldCheck, Heart, Bot, Network, LifeBuoy
} from "lucide-react";

interface HomeModuleProps {
  user: User;
  onNavigate: (route: string) => void;
}

export default function HomeModule({ user, onNavigate }: HomeModuleProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activePersona, setActivePersona] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const cRes = await fetch("/api/contacts");
      const cData = await cRes.json();
      setContacts(cData.contacts || []);

      const campRes = await fetch("/api/campaigns");
      const campData = await campRes.json();
      setCampaigns(campData.campaigns || []);

      const pRes = await fetch("/api/ai/personas");
      const pData = await pRes.json();
      const active = pData.personas?.find((p: any) => p.isActive) || pData.personas?.[0];
      setActivePersona(active || null);
    } catch (e) {
      console.warn("Could not retrieve home dashboard states.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalContacts = contacts.length;
  const totalCampaigns = campaigns.filter(c => c.status === CampaignStatus.COMPLETED).length;
  const hasContacts = totalContacts > 0;
  const hasCampaigns = campaigns.length > 0;

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#fafafa] overflow-y-auto scrollbar-thin select-none">
      {/* Prime Header & Welcome Banner */}
      <div className="border-b border-white/10 bg-[#09090b]/40 backdrop-blur-md p-8 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Workspace Activated
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Hello, {user.fullName.split(" ")[0]}! Welcome to your digital communication workspace.
            </h1>
            <p className="text-sm text-zinc-400">
              Easily connect with customers over WhatsApp & bulk SMS, schedule updates, and let AI help answer support requests.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center p-12 text-xs font-mono text-zinc-500">
          Syncing workspace components...
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full p-8 space-y-10">
          
          {/* Quick Stats Overview */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat 1 */}
            <div 
              onClick={() => onNavigate("/dashboard/crm")}
              className="glass-card p-6 hover:border-indigo-500/30 transition-all cursor-pointer group flex flex-col justify-between h-36"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Total Contacts</span>
                <Users className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white">{totalContacts}</div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                  Manage lists & upload spreadsheets <ArrowRight className="w-3 h-3 text-zinc-550" />
                </div>
              </div>
            </div>

            {/* Stat 2 */}
            <div 
              onClick={() => onNavigate("/dashboard/campaigns")}
              className="glass-card p-6 hover:border-emerald-500/30 transition-all cursor-pointer group flex flex-col justify-between h-36"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Sent Campaigns</span>
                <Megaphone className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white">{totalCampaigns}</div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                  Start bulk customer announcements <ArrowRight className="w-3 h-3 text-zinc-550" />
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <div 
              onClick={() => onNavigate("/dashboard/ai-center")}
              className="glass-card p-6 hover:border-purple-500/30 transition-all cursor-pointer group flex flex-col justify-between h-36"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">AI Assistant Style</span>
                <Bot className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-lg font-bold text-white truncate">
                  {activePersona ? activePersona.name : "Friendly & Helpful"}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                  Manage style & prompt instructions <ArrowRight className="w-3 h-3 text-zinc-550" />
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Notion-style Onboarding checklist */}
          <section className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
              <div>
                <h2 className="text-base font-semibold text-white">Getting Started Guide</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Complete these five simple steps to fully configure your space.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono font-bold text-indigo-300">
                Onboarding Setup
              </span>
            </div>

            <div className="divide-y divide-white/5 font-sans">
              
              {/* Step 1: Uploading Contacts */}
              <div className="p-6 flex items-start gap-4 hover:bg-white/[0.01]/30 transition-colors">
                <div className="mt-1">
                  {hasContacts ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-700 shrink-0 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-500">1</div>
                  )}
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${hasContacts ? "line-through text-zinc-500" : "text-white"}`}>
                      Import your first customers or contacts
                    </h3>
                    {!hasContacts && <span className="px-1.5 py-0.2 bg-indigo-500/10 text-indigo-400 text-[9px] rounded font-bold uppercase tracking-wider">Required</span>}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Import lists from Excel files or type them in manually to start sending structured broadcasts and tracking customer profiles.
                  </p>
                  {!hasContacts && (
                    <button 
                      onClick={() => onNavigate("/dashboard/crm")}
                      className="mt-2.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <span>Go to Contacts</span> <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Step 2: Try Test Mode */}
              <div className="p-6 flex items-start gap-4 hover:bg-white/[0.01]/30 transition-colors">
                <div className="mt-1 font-sans">
                  <div className="w-5 h-5 rounded-full border border-zinc-700 shrink-0 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-500">2</div>
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      Practice messaging in Test Mode
                    </h3>
                    <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-500 text-[9px] rounded font-bold uppercase tracking-wider">Try Now</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Test out bulk broadcasts, simulate automatic replies, and route support requests safely without notifying actual clients.
                  </p>
                  <button 
                    onClick={() => onNavigate("/dashboard/sandbox")}
                    className="mt-2.5 text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <span>Open Test Mode</span> <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Step 3: Tune Assistant Style */}
              <div className="p-6 flex items-start gap-4 hover:bg-white/[0.01]/30 transition-colors">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-full border border-zinc-700 shrink-0 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-500">3</div>
                </div>
                <div className="flex-grow space-y-1">
                  <h3 className="text-sm font-semibold text-white">
                    Customize your AI Assistant conversation style
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Adjust how your AI helper answers support requests. Pick a professional voice, or a warm, conversational mode that fits your brand.
                  </p>
                  <button 
                    onClick={() => onNavigate("/dashboard/ai-center")}
                    className="mt-2.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <span>Go to AI Assistant</span> <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Step 4: Outbound Broadcast */}
              <div className="p-6 flex items-start gap-4 hover:bg-white/[0.01]/30 transition-colors">
                <div className="mt-1">
                  {hasCampaigns ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-zinc-700 shrink-0 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-500">4</div>
                  )}
                </div>
                <div className="flex-grow space-y-1">
                  <h3 className={`text-sm font-semibold ${hasCampaigns ? "line-through text-zinc-500" : "text-white"}`}>
                    Schedule or launch your first helpful broadcast
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Reach your contacts quickly with scheduled announcements. Set up step-by-step target audiences and write engaging updates.
                  </p>
                  {!hasCampaigns && (
                    <button 
                      onClick={() => onNavigate("/dashboard/campaigns")}
                      className="mt-2.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <span>Go to Campaigns</span> <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Step 5: Check Channels setup */}
              <div className="p-6 flex items-start gap-4 hover:bg-white/[0.01]/30 transition-colors">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-full border border-zinc-700 shrink-0 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-500">5</div>
                </div>
                <div className="flex-grow space-y-1">
                  <h3 className="text-sm font-semibold text-white">
                    Link your Meta WhatsApp Verified Domain channels
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Head over to Settings to easily review connected phone gateways, verify active API routes, and configure billing profiles.
                  </p>
                  <button 
                    onClick={() => onNavigate("/dashboard/settings")}
                    className="mt-2.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <span>Open Settings</span> <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* Core Feature Quick launch blocks */}
          <section className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-500">Interactive workspace shortcuts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 border border-white/5 bg-white/[0.01] hover:border-indigo-500/20 rounded-2xl flex items-start gap-4 transition-all">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Network className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Automated Actions Builder</h4>
                  <p className="text-[11px] text-zinc-400">Set up rule paths and triggers to instantly answer and check incoming replies.</p>
                  <button onClick={() => onNavigate("/dashboard/workflows")} className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-0.5 font-bold mt-1.5 cursor-pointer">
                    Configure automation <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              <div className="p-5 border border-white/5 bg-white/[0.01] hover:border-indigo-500/20 rounded-2xl flex items-start gap-4 transition-all">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Consent Verification Settings</h4>
                  <p className="text-[11px] text-zinc-400">DPDP and GDPR compliance checklists. Assert recipient permissions before broad deliveries.</p>
                  <button onClick={() => onNavigate("/dashboard/privacy")} className="text-[10px] text-purple-400 hover:underline inline-flex items-center gap-0.5 font-bold mt-1.5 cursor-pointer">
                    Confirm recipient consent <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Warm Bottom Message */}
          <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-500 font-mono py-8 border-t border-white/5 uppercase tracking-widest">
            <span>Powered by OmniChannel UI</span>
            <Heart className="w-3.5 h-3.5 text-red-500/80 saturate-150 animate-pulse" />
            <span>for frictionless customer communication</span>
          </div>

        </div>
      )}
    </div>
  );
}
