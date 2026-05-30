/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { AutomatedActionTemplate, BusinessProduct } from "./workflowTypes";
import { PRESET_TEMPLATES, TEMPLATE_CATEGORIES } from "./templatesData";
import { Sparkles, CheckCircle2, TrendingUp, HelpCircle, ArrowRight, Lightbulb, PlayCircle } from "lucide-react";

interface TemplateLibraryProps {
  activeProduct: BusinessProduct;
  onSelectTemplate: (tpl: AutomatedActionTemplate) => void;
}

export default function TemplateLibrary({ activeProduct, onSelectTemplate }: TemplateLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Filter templates list based on selection
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "All") return PRESET_TEMPLATES;
    return PRESET_TEMPLATES.filter(tpl => tpl.category === selectedCategory);
  }, [selectedCategory]);

  // Dynamic AI Suggestions specifically matching current product and category pairings
  const dynamicAISuggestions = useMemo(() => {
    const pName = activeProduct.name;
    const suggestions: string[] = [];

    if (activeProduct.category === "Subscription") {
      suggestions.push(`For your '${pName}', prioritize automated 'Retention' and 'Billing Failure' templates because subscriptions depend heavily on smooth monthly recurrences.`);
      suggestions.push(`We recommend the 'New Customer Welcome Flow' to instantly explain meal box customization rules and avoid initial day trial dropouts.`);
    } else if (activeProduct.category === "Catering") {
      suggestions.push(`Since '${pName}' leads have custom guest counts, use our 'WhatsApp Lead Qualification' template to auto-screen budgets within minutes.`);
      suggestions.push(`For major venue event catering, schedule the 'Customer Satisfaction Follow-up' precisely 24 hours after events wrap up.`);
    } else {
      suggestions.push(`Try the 'Inactive Customer Re-engagement' template. Send high-converting promo bundles targeting leads who have been silent for 30+ days.`);
    }

    return suggestions;
  }, [activeProduct]);

  return (
    <div className="space-y-6">
      {/* Smart AI Recommendations Header Board */}
      <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-5 shadow-inner">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Smart Assistant Recommendations</span>
              <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase animate-pulse">Active Insight</span>
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Based on your selection of the <strong className="text-indigo-300 font-semibold">{activeProduct.name}</strong> product, our engine highlighted these custom setup guidelines:
            </p>
          </div>
        </div>

        <div className="mt-3.5 pl-12 space-y-2">
          {dynamicAISuggestions.map((sug, i) => (
            <div key={i} className="flex gap-2 text-[11px] text-zinc-350 leading-relaxed">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{sug}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category selector strip */}
      <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-4">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
            selectedCategory === "All"
              ? "bg-indigo-600 text-white"
              : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-white/5 hover:border-white/10"
          }`}
        >
          All Templates ({PRESET_TEMPLATES.length})
        </button>
        {TEMPLATE_CATEGORIES.map((cat) => {
          const count = PRESET_TEMPLATES.filter(t => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-white/5 hover:border-white/10"
              }`}
            >
              <span>{cat}</span>
              {count > 0 && <span className="opacity-60 text-[9px]">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Templates library Grid view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="group relative bg-[#18181b]/35 hover:bg-[#18181b]/60 border border-white/5 hover:border-zinc-750 rounded-2xl p-5 transition-all flex flex-col justify-between"
          >
            {/* Top segment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-white/5 text-[9px] font-mono font-bold uppercase tracking-wider">
                  {tpl.category}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tpl.estimatedImpact}</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                {tpl.name}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {tpl.description}
              </p>
            </div>

            {/* Visual Steps representation block preview */}
            <div className="mt-4 p-3 bg-zinc-950/55 rounded-xl border border-white/5">
              <span className="text-[8px] font-mono uppercase text-zinc-500 block mb-2">Simulated Journey Steps:</span>
              <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-zinc-450 font-mono">
                {tpl.steps.map((st, idx) => (
                  <React.Fragment key={st.id}>
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-white/5 rounded text-zinc-300 font-bold max-w-[130px] truncate">
                      {st.type === "trigger" ? "Starts: " : ""}{st.label}
                    </span>
                    {idx < tpl.steps.length - 1 && (
                      <ArrowRight className="w-2.5 h-2.5 text-zinc-650 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Use-cases & Selection trigger action button */}
            <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between gap-4">
              <div className="text-[10px] text-zinc-500 leading-relaxed max-w-[240px]">
                <strong className="text-zinc-400 uppercase font-bold pr-1 text-[8px] tracking-wide">BEST FOR:</strong>
                <span className="italic">"{tpl.recommendedUseCase}"</span>
              </div>

              <button
                id={`choose-template-${tpl.id}`}
                onClick={() => onSelectTemplate(tpl)}
                className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow group-hover:scale-[1.02] transition-all"
              >
                <span>Choose</span>
                <PlayCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-[#18181b]/15 rounded-2xl border border-zinc-800 border-dashed text-zinc-500 text-xs font-mono">
            No templates registered in this category. We're consistently updating our directory.
          </div>
        )}
      </div>
    </div>
  );
}
