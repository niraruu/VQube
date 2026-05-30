/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, UserRole } from "../types";
import { 
  Home, Users, Megaphone, Bot, Play, LifeBuoy, BarChart2, ShieldCheck, Settings, LogOut
} from "lucide-react";

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  user: User;
  onLogout: () => void;
}

export default function Sidebar({ activeRoute, onNavigate, user, onLogout }: SidebarProps) {
  const menuItems = [
    { label: "Home", route: "/dashboard", icon: Home },
    { label: "Contacts", route: "/dashboard/crm", icon: Users },
    { label: "Campaigns", route: "/dashboard/campaigns", icon: Megaphone },
    { label: "AI Assistant", route: "/dashboard/ai-center", icon: Bot },
    { label: "Test Mode", route: "/dashboard/sandbox", icon: Play },
    { label: "Support", route: "/dashboard/tickets", icon: LifeBuoy },
    { label: "Analytics", route: "/dashboard/analytics", icon: BarChart2 },
    { label: "Team", route: "/dashboard/team", icon: ShieldCheck },
    { label: "Settings", route: "/dashboard/settings", icon: Settings }
  ];

  // Simple clean label helper without technical details
  const cleanLabel = (label: string) => {
    return label;
  };

  return (
    <div className="w-64 shrink-0 bg-[#09090b] border-r border-white/10 flex flex-col h-screen select-none font-sans">
      {/* Organisation Badge */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shrink-0 shadow-md">
          Ω
        </div>
        <div className="overflow-hidden">
          <div className="text-sm font-semibold tracking-tight text-white truncate">OmniChannel AI</div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest truncate">Customer Ops</div>
        </div>
      </div>

      {/* CORE SANDBOX LAUNCHER AREA */}
      <div className="p-4 border-b border-white/10 bg-[#18181b]/30">
        <div className="text-[10px] font-mono text-amber-500/80 uppercase tracking-wider mb-2 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Simulation Testing Environment
        </div>
      </div>

      {/* Left Navigation Rails Tab Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
        <div className="px-3 mb-2 text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-650">
          Engagement Modules
        </div>
        
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeRoute === item.route;
          return (
            <button
              id={`nav-link-${item.route.split("/").pop() || "home"}`}
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`w-full px-3 py-2.5 text-sm rounded-md flex items-center gap-3 transition-all text-left cursor-pointer ${
                isActive
                  ? "sidebar-active-custom text-white font-medium"
                  : "text-zinc-400 sidebar-item-custom"
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-zinc-400"}`} />
              <span>{cleanLabel(item.label)}</span>
            </button>
          );
        })}
      </div>

      {/* Active User session overview */}
      <div className="p-4 mt-auto border-t border-white/5 bg-[#18181b]/20">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-mono font-bold text-zinc-300">
              {user.fullName.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-xs font-medium text-white truncate">{user.fullName}</div>
            <div className="text-[10px] text-zinc-500 truncate font-mono uppercase tracking-wider">
              {user.role}
            </div>
          </div>
        </div>
        <button
          id="logout-btn"
          onClick={onLogout}
          className="w-full py-1.5 px-3 text-[10px] font-mono text-zinc-500 hover:text-red-400 hover:bg-[#18181b]/60 border border-transparent hover:border-red-900/30 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Workspace Session</span>
        </button>
      </div>
    </div>
  );
}
