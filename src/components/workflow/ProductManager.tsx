/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BusinessProduct, AIToneType } from "./workflowTypes";
import { Plus, Sliders, Shield, BrainCircuit, Coffee, ShoppingBag, Package, Trash2, Check, Sparkles } from "lucide-react";

interface ProductManagerProps {
  products: BusinessProduct[];
  onAddProduct: (prod: Omit<BusinessProduct, "id">) => void;
  onDeleteProduct: (id: string) => void;
  selectedProductId: string;
  onSelectProduct: (id: string) => void;
}

export default function ProductManager({
  products,
  onAddProduct,
  onDeleteProduct,
  selectedProductId,
  onSelectProduct
}: ProductManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BusinessProduct["category"]>("Subscription");
  const [defaultAiTone, setDefaultAiTone] = useState<AIToneType>("Warm & Empathetic");
  const [escalationMinutesLimit, setEscalationMinutesLimit] = useState(20);
  const [unresolvedAction, setUnresolvedAction] = useState<BusinessProduct["unresolvedAction"]>("assign_agent");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddProduct({
      name,
      description,
      category,
      defaultAiTone,
      escalationMinutesLimit,
      unresolvedAction
    });
    setName("");
    setDescription("");
    setShowAddForm(false);
  };

  const getProductIcon = (cat: BusinessProduct["category"]) => {
    switch (cat) {
      case "Subscription": return Package;
      case "Catering": return Coffee;
      case "E-commerce": return ShoppingBag;
      default: return Sliders;
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Workspace Products & Services</span>
          </h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">Filter work and apply default AI tones to matching templates</p>
        </div>
        <button
          id="add-new-product-btn"
          onClick={() => setShowAddForm(prev => !prev)}
          className="p-1 px-2 text-[10px] font-bold font-mono bg-zinc-800 text-zinc-300 border border-white/5 rounded-md hover:bg-zinc-750 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>{showAddForm ? "Cancel" : "Add Service"}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 border border-indigo-500/25 bg-indigo-950/10 rounded-xl space-y-3.5 animation-fadeIn">
          <div className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider flex items-center gap-1 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Configure New Offering</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[9px] font-mono uppercase text-zinc-400 mb-1">Service / Product Name</label>
              <input
                id="prod-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meal Subscription, Corporate Coffee"
                className="w-full text-xs px-2.5 py-1.5 bg-zinc-950 border border-white/15 rounded-md text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono uppercase text-zinc-400 mb-1">Business Class Category</label>
              <select
                id="prod-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as BusinessProduct["category"])}
                className="w-full text-xs px-2.5 py-1.5 bg-zinc-950 border border-white/15 rounded-md text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="Subscription">Daily / Weekly Subscription</option>
                <option value="Catering">Event Catering & Bulk Orders</option>
                <option value="E-commerce">E-commerce Products</option>
                <option value="General">General / Custom Service</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-mono uppercase text-zinc-400 mb-1">Brief Description (AI will read this to shape tone)</label>
            <input
              id="prod-desc-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what customers get so key variables qualify correctly"
              className="w-full text-xs px-2.5 py-1.5 bg-zinc-950 border border-white/15 rounded-md text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1.5">
            <div>
              <label className="block text-[9px] font-mono uppercase text-zinc-400 mb-1">AI Voice Personality</label>
              <select
                id="prod-tone-select"
                value={defaultAiTone}
                onChange={(e) => setDefaultAiTone(e.target.value as AIToneType)}
                className="w-full text-xs px-2 py-1 bg-zinc-950 border border-white/15 rounded-md text-white focus:outline-none"
              >
                <option value="Warm & Empathetic">Warm & Empathetic</option>
                <option value="Professional & Direct">Professional & Direct</option>
                <option value="Friendly & Conversational">Friendly & Conversational</option>
                <option value="Energetic & Salesy">Energetic & Salesy</option>
                <option value="Polite & Helpful">Polite & Helpful</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-mono uppercase text-zinc-400 mb-1">SLA Support Limit (Mins)</label>
              <input
                id="prod-sla-input"
                type="number"
                min={5}
                max={120}
                value={escalationMinutesLimit}
                onChange={(e) => setEscalationMinutesLimit(parseInt(e.target.value) || 20)}
                className="w-full text-xs px-2 py-1 bg-zinc-950 border border-white/15 rounded-md text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono uppercase text-zinc-400 mb-1">Escalation Backup Plan</label>
              <select
                id="prod-unresolved-select"
                value={unresolvedAction}
                onChange={(e) => setUnresolvedAction(e.target.value as BusinessProduct["unresolvedAction"])}
                className="w-full text-xs px-2 py-1 bg-zinc-950 border border-white/15 rounded-md text-white focus:outline-none"
              >
                <option value="assign_agent">Assign to Desk Agent</option>
                <option value="voice_call">Initiate Human Callback</option>
                <option value="sms_alert">Manager VIP SMS Alert</option>
              </select>
            </div>
          </div>

          <button
            id="prod-submit-btn"
            type="submit"
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer mt-2"
          >
            Create Product Offering
          </button>
        </form>
      )}

      {/* Product List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {products.map((p) => {
          const isSelected = selectedProductId === p.id;
          const IconComp = getProductIcon(p.category);
          return (
            <div
              key={p.id}
              onClick={() => onSelectProduct(p.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                isSelected
                  ? "bg-indigo-950/25 border-indigo-550 shadow-md shadow-indigo-600/5 ring-1 ring-indigo-550/30"
                  : "bg-zinc-950/40 border-white/5 hover:border-zinc-700 hover:bg-zinc-900/10"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${isSelected ? "bg-indigo-500/15 text-indigo-400" : "bg-zinc-900 text-zinc-400"}`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono px-1.5 py-0.5 bg-zinc-900 text-zinc-400 border border-white/5 rounded capitalize">
                      {p.category}
                    </span>
                    {/* Delete button (only allow delete if not initial seed) */}
                    {!p.id.startsWith("p-meal") && !p.id.startsWith("p-corp") && !p.id.startsWith("p-event") && (
                      <button
                        id={`delete-prod-btn-${p.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove product "${p.name}"?`)) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        className="text-zinc-650 hover:text-red-400 p-0.5 rounded ml-1 transition-all"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-xs font-bold text-white mt-2 leading-tight flex items-center gap-1.5">
                  <span>{p.name}</span>
                  {isSelected && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />}
                </h3>
                <p className="text-[10px] text-zinc-405 mt-1 line-clamp-1 leading-snug">{p.description}</p>
              </div>

              {/* Badges footer */}
              <div className="mt-3.5 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-1 text-[8px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <BrainCircuit className="w-2.5 h-2.5 text-pink-400" />
                  Voice Tone: <span className="text-zinc-300 font-bold">{p.defaultAiTone.split(" ")[0]}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-amber-500" />
                  SLA limit: <span className="text-zinc-300 font-bold">{p.escalationMinutesLimit}m</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
