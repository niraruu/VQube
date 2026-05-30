/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { User } from "../types";
import { 
  BusinessProduct, CustomizedAction, FriendlyStep, AIToneType, AutomatedActionTemplate 
} from "./workflow/workflowTypes";
import { PRESET_PRODUCTS, PRESET_TEMPLATES } from "./workflow/templatesData";
import ProductManager from "./workflow/ProductManager";
import TemplateLibrary from "./workflow/TemplateLibrary";
import VisualFlowBuilder from "./workflow/VisualFlowBuilder";
import TestModeSimulator from "./workflow/TestModeSimulator";
import ActionAnalytics from "./workflow/ActionAnalytics";
import { 
  Sliders, LayoutGrid, Layers, Settings2, PlayCircle, BarChart3, 
  Sparkles, PlusCircle, CheckCircle, Zap, ShieldAlert, Sparkle, AlertCircle
} from "lucide-react";

interface WorkflowModuleProps {
  user: User;
}

// Generate some seed action flows initially matching the products and templates
const initialCustomizedActions: CustomizedAction[] = [
  // MEAL SUBSCRIPTION ACTIONS
  {
    id: "act-1",
    productId: "p-meal-sub",
    templateId: "tpl-1",
    name: "Day 1 Welcome Check-in",
    category: "Onboarding",
    description: "Welcome new subscription users and dynamically text meal schedules.",
    startsWhen: "New Customer Signup",
    aiToneSelection: "Warm & Empathetic",
    customMessageTemplate: "",
    followUpDelayMinutes: 24,
    audienceSegment: "Only Inbound leads",
    callSettings: { enableCallback: true, directLine: "+1 (800) MEAL-VIP", escalationTriggerText: "" },
    steps: [...PRESET_TEMPLATES[0].steps],
    isActive: true,
    metrics: { runsCompleted: 142, engagementRate: 88, aiResolutionRate: 72, humanSupportRequests: 12, completionRate: 91 }
  },
  {
    id: "act-2",
    productId: "p-meal-sub",
    templateId: "tpl-7",
    name: "Pre-Renewal Menus Dispatch",
    category: "Customer Retention",
    description: "Remind subscribers of upcoming organic menus 3 days prior to renew triggers.",
    startsWhen: "3 Days remaining before subscription renews",
    aiToneSelection: "Friendly & Conversational",
    customMessageTemplate: "",
    followUpDelayMinutes: 48,
    audienceSegment: "VIP Premium Users",
    callSettings: { enableCallback: false, directLine: "+1 (800) MEAL-VIP", escalationTriggerText: "" },
    steps: [...PRESET_TEMPLATES[6].steps],
    isActive: true,
    metrics: { runsCompleted: 380, engagementRate: 92, aiResolutionRate: 85, humanSupportRequests: 18, completionRate: 95 }
  },
  {
    id: "act-3",
    productId: "p-meal-sub",
    templateId: "tpl-8",
    name: "Subscription Retry Assist",
    category: "Billing & Payments",
    description: "Soothe transaction retry failures gracefully with friendly helper options.",
    startsWhen: "Gateway declines renewal transaction",
    aiToneSelection: "Warm & Empathetic",
    customMessageTemplate: "",
    followUpDelayMinutes: 12,
    audienceSegment: "Active Trial Users",
    callSettings: { enableCallback: true, directLine: "+1 (800) MEAL-VIP", escalationTriggerText: "" },
    steps: [...PRESET_TEMPLATES[7].steps],
    isActive: true,
    metrics: { runsCompleted: 54, engagementRate: 76, aiResolutionRate: 64, humanSupportRequests: 14, completionRate: 74 }
  },

  // CORPORATE CATERING ACTIONS
  {
    id: "act-4",
    productId: "p-corp-catering",
    templateId: "tpl-3",
    name: "Corporate Lead Quick Qualifying",
    category: "Lead Generation",
    description: "Inquire on event scale, attendee counts and budget limits via WhatsApp automatically.",
    startsWhen: "Inbound interest text received on corporate WhatsApp",
    aiToneSelection: "Professional & Direct",
    customMessageTemplate: "",
    followUpDelayMinutes: 2,
    audienceSegment: "Only Inbound leads",
    callSettings: { enableCallback: true, directLine: "+1 (888) CATER-HOTL", escalationTriggerText: "" },
    steps: [...PRESET_TEMPLATES[2].steps],
    isActive: true,
    metrics: { runsCompleted: 210, engagementRate: 82, aiResolutionRate: 70, humanSupportRequests: 45, completionRate: 78 }
  },
  {
    id: "act-5",
    productId: "p-corp-catering",
    templateId: "tpl-2",
    name: "Catering Quote Rescue",
    category: "Sales",
    description: "Follow up customizable quotation lists left idle for over 4 hours.",
    startsWhen: "Pricing inquiry idle with no checkout",
    aiToneSelection: "Professional & Direct",
    customMessageTemplate: "",
    followUpDelayMinutes: 4,
    audienceSegment: "VIP Premium Users",
    callSettings: { enableCallback: false, directLine: "+1 (888) CATER-HOTL", escalationTriggerText: "" },
    steps: [...PRESET_TEMPLATES[1].steps],
    isActive: true,
    metrics: { runsCompleted: 94, engagementRate: 68, aiResolutionRate: 50, humanSupportRequests: 22, completionRate: 72 }
  },

  // EVENT ORDERS ACTIONS
  {
    id: "act-6",
    productId: "p-event-orders",
    templateId: "tpl-10",
    name: "Event Satisfaction Follow-up",
    category: "Customer Retention",
    description: "Request reviews automatically 2 hours after food catering wraps up.",
    startsWhen: "Meal box delivered or transaction completed successfully",
    aiToneSelection: "Friendly & Conversational",
    customMessageTemplate: "",
    followUpDelayMinutes: 2,
    audienceSegment: "VIP Premium Users",
    callSettings: { enableCallback: false, directLine: "+1 (555) EVENT-LINE", escalationTriggerText: "" },
    steps: [...PRESET_TEMPLATES[9].steps],
    isActive: true,
    metrics: { runsCompleted: 115, engagementRate: 84, aiResolutionRate: 78, humanSupportRequests: 6, completionRate: 94 }
  }
];

export default function WorkflowModule({ user }: WorkflowModuleProps) {
  const [products, setProducts] = useState<BusinessProduct[]>(PRESET_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<string>(PRESET_PRODUCTS[0].id);
  const [customizedActions, setCustomizedActions] = useState<CustomizedAction[]>(initialCustomizedActions);

  // Active view controller tabs:
  // "active-actions" (SaaS customized dashboard actions),
  // "templates" (Ready-made Template Library),
  // "builder" (Visual Builder workspace edit mode)
  // "test-mode" (Simulator laboratory)
  // "analytics" (Human-friendly trend charts)
  const [activeTab, setActiveTab] = useState<"active-actions" | "templates" | "builder" | "test-mode" | "analytics">("active-actions");
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  // Derive selected product object
  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  // Filter actions belonging to current selected product
  const productActions = useMemo(() => {
    return customizedActions.filter(act => act.productId === selectedProductId);
  }, [customizedActions, selectedProductId]);

  // Add customized offering
  const handleAddProduct = (prod: Omit<BusinessProduct, "id">) => {
    const newId = `p-${Date.now()}`;
    const newProd: BusinessProduct = {
      ...prod,
      id: newId
    };
    setProducts(prev => [...prev, newProd]);
    setSelectedProductId(newId);
    setActiveTab("templates"); // Immediately prompt them with templates library for this new service!
  };

  // Remove custom product
  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCustomizedActions(prev => prev.filter(act => act.productId !== id));
    if (selectedProductId === id) {
      setSelectedProductId(PRESET_PRODUCTS[0].id);
    }
  };

  // Select workflow template to launch customize sequence
  const handleSelectTemplate = (tpl: AutomatedActionTemplate) => {
    const newActionId = `act-${Date.now()}`;
    const initialAction: CustomizedAction = {
      id: newActionId,
      productId: selectedProductId,
      templateId: tpl.id,
      name: `Custom ${tpl.name}`,
      category: tpl.category,
      description: tpl.description,
      startsWhen: tpl.steps.find(s => s.type === "trigger")?.description || "Inbound Customer Event detected",
      aiToneSelection: activeProduct.defaultAiTone,
      customMessageTemplate: "",
      followUpDelayMinutes: 2,
      audienceSegment: "Only Inbound leads",
      callSettings: {
        enableCallback: activeProduct.unresolvedAction === "voice_call",
        directLine: "+1 (800) SERVICE-HOTL",
        escalationTriggerText: ""
      },
      steps: tpl.steps.map(step => ({
        ...step,
        config: {
          ...step.config,
          aiToneOverride: step.type === "ai_action" ? activeProduct.defaultAiTone : step.config.aiToneOverride
        }
      })),
      isActive: true,
      metrics: { runsCompleted: 0, engagementRate: 0, aiResolutionRate: 0, humanSupportRequests: 0, completionRate: 0 }
    };

    setCustomizedActions(prev => [initialAction, ...prev]);
    setEditingActionId(newActionId);
    setActiveTab("builder"); // Toggle directly to form builder!
  };

  // Trigger edit of existing customised actions
  const handleEditAction = (actionId: string) => {
    setEditingActionId(actionId);
    setActiveTab("builder");
  };

  const activeEditingAction = useMemo(() => {
    return customizedActions.find(act => act.id === editingActionId) || productActions[0];
  }, [customizedActions, editingActionId, productActions]);

  const handleUpdateActiveEditingAction = (updated: CustomizedAction) => {
    setCustomizedActions(prev => prev.map(act => act.id === updated.id ? updated : act));
  };

  const handleToggleActionActive = (actionId: string) => {
    setCustomizedActions(prev => prev.map(act => {
      if (act.id === actionId) {
        return {
          ...act,
          isActive: !act.isActive
        };
      }
      return act;
    }));
  };

  const handleDeleteAction = (actionId: string) => {
    setCustomizedActions(prev => prev.filter(act => act.id !== actionId));
    if (editingActionId === actionId) {
      setEditingActionId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#fafafa] font-sans pb-10 overflow-y-auto scrollbar-thin">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 bg-[#09090b]/80 backdrop-blur-sm p-6 sticky top-0 z-10 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Automated Actions Workspace</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Instantly set up smart communication campaigns, WhatsApp followups, and human support triggers per product offering.
          </p>
        </div>

        {/* Global tab manager */}
        <div className="flex flex-wrap gap-1 bg-[#18181b]/60 border border-white/5 p-1 rounded-xl">
          <button
            id="tab-active-actions"
            onClick={() => {
              setActiveTab("active-actions");
              setEditingActionId(null);
            }}
            className={`px-3.5 py-1.5 text-xs rounded-lg transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "active-actions" ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-zinc-250"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Active Actions ({productActions.length})</span>
          </button>

          <button
            id="tab-templates"
            onClick={() => {
              setActiveTab("templates");
              setEditingActionId(null);
            }}
            className={`px-3.5 py-1.5 text-xs rounded-lg transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "templates" ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-zinc-250"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 animate-pulse" />
            <span>Template Library</span>
          </button>

          {editingActionId && (
            <button
              id="tab-active-builder"
              onClick={() => setActiveTab("builder")}
              className={`px-3.5 py-1.5 text-xs rounded-lg transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
                activeTab === "builder" ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-zinc-250"
              }`}
            >
              <Settings2 className="w-3.5 h-3.5 text-pink-400" />
              <span>Modify Flow</span>
            </button>
          )}

          {editingActionId && (
            <button
              id="tab-active-test"
              onClick={() => setActiveTab("test-mode")}
              className={`px-3.5 py-1.5 text-xs rounded-lg transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
                activeTab === "test-mode" ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-zinc-250"
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Try in Test Mode</span>
            </button>
          )}

          {editingActionId && activeEditingAction && activeEditingAction.metrics.runsCompleted > 0 && (
            <button
              id="tab-active-analytics"
              onClick={() => setActiveTab("analytics")}
              className={`px-3.5 py-1.5 text-xs rounded-lg transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
                activeTab === "analytics" ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-zinc-250"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Performance</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-7 w-full">
        {/* SECTION 1: Product Context Switcher - Available in all states except focused Builder */}
        {activeTab !== "builder" && activeTab !== "test-mode" && (
          <ProductManager
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            selectedProductId={selectedProductId}
            onSelectProduct={(id) => {
              setSelectedProductId(id);
              if (activeTab === "builder" || activeTab === "test-mode" || activeTab === "analytics") {
                setActiveTab("active-actions");
              }
            }}
          />
        )}

        {/* SECTION 2: Layout Content Renderer */}

        {/* TAB 1: Active Actions dashboard listings */}
        {activeTab === "active-actions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                  <Sliders className="w-4 h-4 text-zinc-400" />
                  <span>Customized Actions list for: <strong className="text-indigo-400 font-bold">{activeProduct.name}</strong></span>
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">These flows trigger automatically when event hooks occur real-time.</p>
              </div>

              {productActions.length === 0 && (
                <button
                  id="empty-action-add-trigger"
                  onClick={() => setActiveTab("templates")}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Choose Your First Template</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productActions.map((action) => (
                <div
                  key={action.id}
                  className={`bg-[#18181b]/35 border rounded-2xl p-5 hover:bg-[#18181b]/60 transition-all flex flex-col justify-between ${
                    action.isActive ? "border-white/5" : "border-white/5 opacity-60"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wider bg-zinc-900 border border-white/5 text-zinc-450 uppercase font-bold">
                        {action.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Interactive trigger selector */}
                        <label className="relative inline-flex items-center cursor-pointer select-none text-[10px] font-mono text-zinc-400 gap-1.5">
                          <span>{action.isActive ? "Live" : "Paused"}</span>
                          <input
                            id={`toggle-action-${action.id}`}
                            type="checkbox"
                            checked={action.isActive}
                            onChange={() => handleToggleActionActive(action.id)}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-zinc-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[15px] after:bg-zinc-650 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">{action.name}</h4>
                      <p className="text-[11px] text-zinc-405 leading-relaxed mt-1 line-clamp-2">{action.description}</p>
                    </div>

                    <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-white/5 space-y-1 text-[9.5px] leading-relaxed">
                      <div>
                        <span className="text-zinc-555 font-mono uppercase">Starts When:</span>{" "}
                        <strong className="text-zinc-305 font-medium">{action.startsWhen}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-555 font-mono uppercase">Voice Tone:</span>{" "}
                        <span className="text-indigo-400 font-mono font-bold">{action.aiToneSelection}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between gap-1.5">
                    {/* Diagnostic Metrics counts */}
                    <div className="text-[9.5px] text-zinc-500 font-mono flex items-center gap-1.5">
                      <span className="font-bold text-indigo-400">{action.metrics.runsCompleted}</span> runs completed
                    </div>

                    <div className="flex gap-1">
                      <button
                        id={`edit-act-${action.id}`}
                        onClick={() => handleEditAction(action.id)}
                        className="p-1.5 px-3 bg-zinc-900 border border-white/5 hover:border-zinc-700 text-zinc-300 hover:text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Customize
                      </button>

                      <button
                        id={`test-act-${action.id}`}
                        onClick={() => {
                          setEditingActionId(action.id);
                          setActiveTab("test-mode");
                        }}
                        className="p-1.5 px-3 bg-[#0a2342]/40 hover:bg-[#0a2342]/70 border border-blue-500/10 text-cyan-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Simulate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {productActions.length === 0 && (
              <div className="text-center py-16 bg-[#18181b]/15 rounded-2xl border border-zinc-800 border-dashed space-y-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-indigo-500/15">
                  <Sparkle className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-xs font-bold text-white">No active actions configured for {activeProduct.name}</h4>
                  <p className="text-[11px] text-zinc-550 leading-relaxed">
                    Choose one of our hand-selected automation templates to get qualified interactions running for client inquiries!
                  </p>
                </div>
                <button
                  id="empty-action-add-center-btn"
                  onClick={() => setActiveTab("templates")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex"
                >
                  Open Template Library
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Ready-made Templates list */}
        {activeTab === "templates" && (
          <TemplateLibrary
            activeProduct={activeProduct}
            onSelectTemplate={handleSelectTemplate}
          />
        )}

        {/* TAB 3: Visual builder workspace editing node flow */}
        {activeTab === "builder" && activeEditingAction && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-3">
              <span className="text-xs text-zinc-555 font-mono">Workspace Offering:</span>
              <span className="text-xs font-bold text-indigo-305 bg-indigo-950/20 px-2 py-0.5 rounded-md border border-indigo-500/10">
                {activeProduct.name}
              </span>
              <span className="text-zinc-650 font-mono text-xs">/</span>
              <span className="text-xs text-zinc-350">{activeEditingAction.name}</span>
            </div>

            <VisualFlowBuilder
              action={activeEditingAction}
              activeProduct={activeProduct}
              onUpdateAction={handleUpdateActiveEditingAction}
              onSave={() => {
                setActiveTab("active-actions");
              }}
              onCancel={() => {
                setActiveTab("active-actions");
              }}
            />
          </div>
        )}

        {/* TAB 4: Simulation modes */}
        {activeTab === "test-mode" && activeEditingAction && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-mono">Test Simulator:</span>
                <span className="text-xs font-bold text-white">[{activeEditingAction.name}]</span>
              </div>
              <button
                id="simulator-back-to-editor-btn"
                onClick={() => setActiveTab("builder")}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 hover:text-white rounded-lg border border-white/5 transition-all cursor-pointer"
              >
                Back to Editor
              </button>
            </div>

            <TestModeSimulator
              action={activeEditingAction}
              activeProduct={activeProduct}
            />
          </div>
        )}

        {/* TAB 5: Analytics & Progression trends */}
        {activeTab === "analytics" && activeEditingAction && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-bold text-zinc-350">Automated Action Perf: {activeEditingAction.name}</span>
              <button
                onClick={() => setActiveTab("active-actions")}
                className="text-xs py-1 px-3 bg-zinc-900 text-zinc-300 rounded hover:text-white cursor-pointer"
              >
                Back to dashboard
              </button>
            </div>

            <ActionAnalytics action={activeEditingAction} />
          </div>
        )}
      </div>
    </div>
  );
}
