/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FriendlyStep, CustomizedAction, AIToneType, BusinessProduct } from "./workflowTypes";
import { 
  Play, Sparkles, MessageSquare, ShieldAlert, CheckCircle, 
  Settings, Clock, Bell, PhoneCall, Save, Undo2, Users, HelpCircle, ArrowDown 
} from "lucide-react";

interface VisualFlowBuilderProps {
  action: CustomizedAction;
  activeProduct: BusinessProduct;
  onUpdateAction: (updated: CustomizedAction) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function VisualFlowBuilder({
  action,
  activeProduct,
  onUpdateAction,
  onSave,
  onCancel
}: VisualFlowBuilderProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(action.steps[0]?.id || null);

  // Quick state overrides for core customization fields
  const handleMetaChange = (field: keyof CustomizedAction, value: any) => {
    onUpdateAction({
      ...action,
      [field]: value
    });
  };

  const handleCallSettingsChange = (field: string, value: any) => {
    onUpdateAction({
      ...action,
      callSettings: {
        ...action.callSettings,
        [field]: value
      }
    });
  };

  const handleStepConfigChange = (stepId: string, configField: string, value: any) => {
    const updatedSteps = action.steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          config: {
            ...step.config,
            [configField]: value
          }
        };
      }
      return step;
    });

    onUpdateAction({
      ...action,
      steps: updatedSteps
    });
  };

  const selectedStep = action.steps.find(s => s.id === selectedStepId);

  const getStepIcon = (type: FriendlyStep["type"]) => {
    switch (type) {
      case "trigger": return Play;
      case "ai_action": return Sparkles;
      case "campaign": return MessageSquare;
      case "condition": return Settings;
      default: return PhoneCall;
    }
  };

  const getStepColors = (type: FriendlyStep["type"], isSelected: boolean) => {
    const base = isSelected ? "ring-2 ring-indigo-505" : "border-white/5 bg-[#18181b]/35 hover:bg-zinc-800/10";
    switch (type) {
      case "trigger":
        return `${base} border-indigo-500/20 text-indigo-400 bg-indigo-950/5`;
      case "ai_action":
        return `${base} border-purple-500/20 text-purple-400 bg-purple-950/5`;
      case "campaign":
        return `${base} border-pink-500/20 text-pink-400 bg-pink-950/5`;
      case "condition":
        return `${base} border-zinc-500/20 text-zinc-300 bg-zinc-900/10`;
      default:
        return `${base} border-amber-500/20 text-amber-400 bg-amber-950/5`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT: Visual Node Flow Chain */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-mono tracking-wider font-bold text-indigo-400 uppercase">Interactive Flow Map</span>
              <h3 className="text-xs font-bold text-white mt-0.5">Click any step to edit details</h3>
            </div>
            <span className="text-[9px] font-mono text-zinc-550 italic">Connected sequentially</span>
          </div>

          <div className="flex flex-col items-center py-4 w-full max-w-md space-y-2">
            {action.steps.map((step, idx) => {
              const StepIcon = getStepIcon(step.type);
              const isSelected = selectedStepId === step.id;
              
              return (
                <React.Fragment key={step.id}>
                  {/* Step Card node */}
                  <div
                    id={`builder-step-${step.id}`}
                    onClick={() => setSelectedStepId(step.id)}
                    className={`w-full p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${getStepColors(step.type, isSelected)}`}
                  >
                    <div className="flex items-center gap-3 w-full overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-black/35 flex items-center justify-center shrink-0 border border-white/5">
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[9px] font-mono uppercase opacity-55 tracking-wider font-semibold">Step {idx + 1}: {step.type.replace("_", " ")}</div>
                        <h4 className="text-xs font-bold text-white truncate">{step.label}</h4>
                        <p className="text-[10px] text-zinc-400 truncate leading-relaxed mt-0.5">{step.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 text-[8px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/35 uppercase select-none shrink-0 animate-pulse">Selected</span>
                    )}
                  </div>

                  {/* Connect arrow (if not last) */}
                  {idx < action.steps.length - 1 && (
                    <div className="flex flex-col items-center justify-center h-6 select-none opacity-50">
                      <ArrowDown className="w-4 h-4 text-zinc-600 animate-bounce" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Audience Segment & Timing config summary */}
        <div className="bg-[#18181b]/30 border border-white/5 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-zinc-500">Audience Segment</span>
              <h4 className="text-xs font-bold text-white mt-0.5">Targeting Segment: {action.audienceSegment}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400">
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-zinc-500">Timing Interval</span>
              <h4 className="text-xs font-bold text-white mt-0.5">Delay Step duration: {action.followUpDelayMinutes} Hours</h4>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Selected Step Editing Panel (No JSON! Pure Form!) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-zinc-900/80 border border-white/15 rounded-2xl p-5 shadow-2xl space-y-5">
          <div className="border-b border-white/5 pb-3">
            <span className="text-[10px] font-mono tracking-wider text-pink-400 uppercase font-semibold">Customization Assistant</span>
            <h2 className="text-sm font-bold text-white mt-0.5">
              {selectedStep ? `Configure: ${selectedStep.label}` : "Choose a step to configure"}
            </h2>
          </div>

          {selectedStep ? (
            <div className="space-y-4">
              {/* Form specifically crafted for TRIGGERS */}
              {selectedStep.type === "trigger" && (
                <div className="space-y-3.5 animation-fadeIn">
                  <p className="text-[11px] text-zinc-350 leading-relaxed bg-[#18181b] p-3 rounded-xl border border-white/5">
                    This action gets launched automatically when matching subscription events are logged to our databases.
                  </p>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1.5">Action Starts When...</label>
                    <input
                      id="edit-starts-when"
                      type="text"
                      className="w-full text-xs px-3 py-2 bg-zinc-950 border border-white/15 rounded-lg text-white font-semibold focus:outline-none focus:border-indigo-500"
                      value={action.startsWhen}
                      onChange={(e) => handleMetaChange("startsWhen", e.target.value)}
                      placeholder="e.g. New customer signs up/completed booking"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1.5">Target Audience Category</label>
                    <select
                      id="edit-audience-segment"
                      className="w-full text-xs px-3 py-2 bg-zinc-950 border border-white/11 rounded-lg text-white"
                      value={action.audienceSegment}
                      onChange={(e) => handleMetaChange("audienceSegment", e.target.value)}
                    >
                      <option value="Leads">Only Inbound leads</option>
                      <option value="Premium Users">VIP Premium Users</option>
                      <option value="Trial Users">Active Trial Users</option>
                      <option value="Inactive Users">Inactive Trial Users</option>
                      <option value="Re-engagement">Re-engagement segmented</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Form specifically crafted for AI ACTOR ACTIONS */}
              {selectedStep.type === "ai_action" && (
                <div className="space-y-3.5 animation-fadeIn">
                  <p className="text-[11px] text-zinc-450 leading-relaxed bg-[#18181b] p-3 rounded-xl border border-white/5">
                    The AI engine automatically shapes personalization hooks, parses sentiment indexes, and modifies tone based on these parameters.
                  </p>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1.5">AI Language Dialects Tone</label>
                    <select
                      id="edit-ai-tone"
                      className="w-full text-xs px-3 py-2 bg-zinc-950 border border-white/11 rounded-lg text-white font-mono"
                      value={action.aiToneSelection}
                      onChange={(e) => handleMetaChange("aiToneSelection", e.target.value as AIToneType)}
                    >
                      <option value="Warm & Empathetic">Warm & Empathetic</option>
                      <option value="Professional & Direct">Professional & Direct</option>
                      <option value="Friendly & Conversational">Friendly & Conversational</option>
                      <option value="Energetic & Salesy">Energetic & Salesy</option>
                      <option value="Polite & Helpful">Polite & Helpful</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1.5">Model Override Directives</label>
                    <input
                      id="edit-step-ai-prompt"
                      type="text"
                      className="w-full text-xs px-3 py-2 bg-zinc-950 border border-white/15 rounded-lg text-white"
                      value={selectedStep.config.aiToneOverride || ""}
                      onChange={(e) => handleStepConfigChange(selectedStep.id, "aiToneOverride", e.target.value)}
                      placeholder="e.g. Prioritize allergen concerns if stated in notes"
                    />
                  </div>
                </div>
              )}

              {/* Form specifically crafted for WHATSAPP / BROADCAST CAMPAIGNS */}
              {selectedStep.type === "campaign" && (
                <div className="space-y-3.5 animation-fadeIn">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Transmission Pipeline</label>
                    <select
                      id="edit-step-channel"
                      className="w-full text-xs px-2.5 py-1.5 bg-zinc-950 border border-white/11 rounded-lg text-white"
                      value={selectedStep.config.channel || "WhatsApp"}
                      onChange={(e) => handleStepConfigChange(selectedStep.id, "channel", e.target.value)}
                    >
                      <option value="WhatsApp">Official WhatsApp API Business Channel</option>
                      <option value="Bulk SMS">Carrier Bulk SMS Gateway</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 flex justify-between items-center">
                      <span>Message Draft Template</span>
                      <span className="text-[8px] px-1.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 font-mono rounded">Variables approved</span>
                    </label>
                    <textarea
                      id="edit-step-message-draft"
                      rows={5}
                      className="w-full text-xs px-3 py-2.5 bg-zinc-950 border border-white/15 rounded-lg text-zinc-300 font-sans focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
                      value={selectedStep.config.messageText || ""}
                      onChange={(e) => handleStepConfigChange(selectedStep.id, "messageText", e.target.value)}
                      placeholder="Use {{customer_name}} to personalise"
                    />
                    <div className="text-[9px] text-zinc-500">Insert placeholders like <span className="font-mono text-zinc-400">&#123;&#123;customer_name&#125;&#125;</span> or <span className="font-mono text-zinc-400">&#123;&#123;product_name&#125;&#125;</span> back into drafts securely.</div>
                  </div>
                </div>
              )}

              {/* Form specifically crafted for DELAYS OR CONDITIONS RULES */}
              {selectedStep.type === "condition" && (
                <div className="space-y-3.5 animation-fadeIn">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 flex justify-between">
                      <span>Workflow Rules Verification</span>
                      <span className="text-zinc-550 font-mono">No coding required</span>
                    </label>
                    <input
                      id="edit-step-condition-rule"
                      type="text"
                      className="w-full text-xs px-3 py-2 bg-zinc-950 border border-white/15 rounded-lg text-white font-mono"
                      value={selectedStep.config.ruleExpression || ""}
                      onChange={(e) => handleStepConfigChange(selectedStep.id, "ruleExpression", e.target.value)}
                      placeholder="e.g. Has selected checkout links is False"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1 flex justify-between">
                      <span>Follow-up Response Window Delay (Hours)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="edit-delay-slider"
                        type="range"
                        min={1}
                        max={72}
                        className="flex-1 accent-indigo-500 h-1.5 bg-zinc-950 rounded-lg cursor-pointer"
                        value={action.followUpDelayMinutes}
                        onChange={(e) => handleMetaChange("followUpDelayMinutes", parseInt(e.target.value))}
                      />
                      <span className="text-xs font-mono text-white text-nowrap font-bold">{action.followUpDelayMinutes} hours</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">The system will hold execution logs during this window prior to triggering Rules evaluation steps.</p>
                  </div>
                </div>
              )}

              {/* Form specifically crafted for ESCALATIONS OR CALLBACK CRITERIAS */}
              {selectedStep.type === "escalation" && (
                <div className="space-y-3.5 animation-fadeIn">
                  <p className="text-[11px] text-zinc-400 leading-relaxed bg-[#18181b] p-3 rounded-xl border border-white/5">
                    If rules fail, request human support to avoid churn risks or provide urgent assistance.
                  </p>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Human Team Notifications Rule</label>
                    <select
                      id="edit-step-notify-rule"
                      className="w-full text-xs px-3 py-2 bg-zinc-950 border border-white/11 rounded-lg text-white"
                      value={selectedStep.config.escalationMethod || "Notify Customer Success Escalation Unit"}
                      onChange={(e) => handleStepConfigChange(selectedStep.id, "escalationMethod", e.target.value)}
                    >
                      <option value="Notify Customer Success Escalation Unit">Notify Customer Success Escalation Unit</option>
                      <option value="Schedule Outbound Call">Schedule Outbound Voice Callback</option>
                      <option value="Alert Business Administrator">Alert Account Administrator Team</option>
                    </select>
                  </div>

                  <div className="border border-white/5 rounded-xl p-3 bg-zinc-950/40 space-y-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-400 flex items-center gap-1.5 pr-0.5">
                      <PhoneCall className="w-3.5 h-3.5 text-amber-450" />
                      Voice Callbacks settings
                    </span>

                    <div className="flex items-center gap-3 justify-between py-1 border-b border-white/5 mb-1">
                      <span className="text-[11px] text-zinc-400 font-medium">Enable Scheduling Links:</span>
                      <input
                        id="edit-enable-callback"
                        type="checkbox"
                        checked={action.callSettings.enableCallback}
                        onChange={(e) => handleCallSettingsChange("enableCallback", e.target.checked)}
                        className="w-4 h-4 rounded bg-zinc-950 border-white/15 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono uppercase text-zinc-550 mb-1">Backup Hotline Number</label>
                      <input
                        id="edit-phone-hotline"
                        type="text"
                        className="w-full text-xs px-2.5 py-1 bg-zinc-950 border border-white/15 rounded text-white font-mono"
                        value={action.callSettings.directLine}
                        onChange={(e) => handleCallSettingsChange("directLine", e.target.value)}
                        placeholder="+1-800-FOOD-OMNI"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-zinc-555 font-mono italic">
              Please choose a flow map step from left.
            </div>
          )}
        </div>

        {/* Builder bottom belt triggers: SAVE OR CANCEL */}
        <div className="flex gap-2">
          <button
            id="cancel-builder-btn"
            onClick={onCancel}
            className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
            <span>Discard</span>
          </button>

          <button
            id="save-builder-btn"
            onClick={onSave}
            className="flex-grow py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Launch Action</span>
          </button>
        </div>
      </div>
    </div>
  );
}
