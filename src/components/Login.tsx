/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, UserRole } from "../types";
import { KeyRound, ShieldAlert, Sparkles } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("nirjarajain01@gmail.com");
  const [role, setRole] = useState<UserRole>(UserRole.ORG_OWNER);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role })
      });

      if (!res.ok) {
        throw new Error("Authentication credential validation failed.");
      }

      const data = await res.json();
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/google-login", { method: "POST" });
      const data = await res.json();
      onLoginSuccess(data.user);
    } catch (err) {
      setError("Google SSO authentication gateway timeout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card shadow-2xl overflow-hidden">
        {/* Decorative banner */}
        <div className="relative px-6 py-8 bg-[#18181b]/50 border-b border-white/10 text-center">
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono uppercase tracking-wider text-indigo-400">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            V2.5 Stable
          </div>
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-white font-sans">OmniChannel AI Platform</h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Workspace Customer Administrative Console</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs bg-red-950/40 border border-red-900/50 rounded-lg text-red-300">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                Corporate Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.com"
                className="w-full px-3 py-2 text-sm bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                Select Workspace Seat Role
              </label>
              <select
                id="login-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50 transition-colors cursor-pointer"
              >
                <option value={UserRole.ORG_OWNER}>Organization Owner (Full Access)</option>
                <option value={UserRole.ORG_ADMIN}>Organization Administrative Manager</option>
                <option value={UserRole.SUPPORT_AGENT}>Customer Support Agent</option>
                <option value={UserRole.MARKETING_MANAGER}>Outbound Marketing Manager</option>
                <option value={UserRole.VIEWER}>Read-Only Guest Viewer</option>
              </select>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all flex items-center justify-center select-none cursor-pointer shadow-lg shadow-indigo-500/15"
            >
              {isSubmitting ? "Locking workspace credentials..." : "Sign In to Communications Console"}
            </button>
          </form>

          <div className="relative my-5 text-center">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </span>
            <span className="relative px-2 bg-[#09090b] text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
              Secure Auth Link
            </span>
          </div>

          <button
            id="google-sso-btn"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-2.5 px-3 text-xs font-medium text-zinc-300 bg-[#18181b]/60 hover:bg-[#27272a]/60 border border-white/10 hover:border-zinc-500/30 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Simulate Google Single Sign-on</span>
          </button>
        </div>

        <div className="bg-[#18181b]/40 border-t border-white/5 p-4 text-[11px] text-zinc-500 font-mono text-center">
          OmniChannel compliance is verified with dual-layer India DPDP 2023 and GDPR systems.
        </div>
      </div>
    </div>
  );
}
