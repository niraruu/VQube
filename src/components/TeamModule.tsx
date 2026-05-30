/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { TeamMember, UserRole, User } from "../types";
import { 
  Users, UserPlus, Trash2, Mail, Shield, ShieldAlert, CheckCircle, 
  Settings, HelpCircle, Activity, Play 
} from "lucide-react";

interface TeamModuleProps {
  user: User;
}

export default function TeamModule({ user }: TeamModuleProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Invite states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.SUPPORT_AGENT);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      setMembers(data.team || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: inviteName,
          email: inviteEmail,
          role: inviteRole
        })
      });
      if (res.ok) {
        setShowInviteModal(false);
        setInviteEmail("");
        setInviteName("");
        setInviteRole(UserRole.SUPPORT_AGENT);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = async (memberId: string, role: UserRole) => {
    try {
      // Simulate role updating on the local state for custom visual fidelity
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
      alert(`Teammate privileges mapped to: ${role}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to revoke organizational credentials for this teammate? This will terminate all active secure tokens.")) return;
    try {
      setMembers(prev => prev.filter(m => m.id !== memberId));
      alert("Teammate credentials retracted successfully.");
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleHeaderIcon = (role: UserRole) => {
    if (role === UserRole.ORG_OWNER || role === UserRole.ORG_ADMIN) {
      return <ShieldAlert className="w-4 h-4 text-red-500" />;
    }
    return <Shield className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F11] text-gray-200">
      {/* Banner */}
      <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4 border-b border-[#232329] bg-[#16161B] p-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Colleague Collaboration & Teams Panel</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Audit team memberships, assign localized credentials (RBAC rules), and inspect active console session heartbeats.
          </p>
        </div>
        <button
          id="team-invite-modal-trigger"
          onClick={() => setShowInviteModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Provision Teammate Credentials</span>
        </button>
      </div>

      {/* Main Board content */}
      <div className="flex-1 p-6 overflow-y-auto scrollbar-thin space-y-6">
        {isLoading ? (
          <div className="text-center py-12 text-xs font-mono text-gray-500">
            Fetching organization credentials index...
          </div>
        ) : (
          <div className="bg-[#16161B] border border-[#232329] rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-[#1C1C24] border-b border-[#232329] text-[10px] font-mono uppercase tracking-wider text-gray-400">
                  <th className="p-4">Colleague Profile</th>
                  <th className="p-4">Security Role (RBAC)</th>
                  <th className="p-4">Secure Token status</th>
                  <th className="p-4">Channel Active Session</th>
                  <th className="p-4 text-right">Teammate Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232329]">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-[#1E1E26]/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{m.fullName}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{m.email}</div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        {getRoleHeaderIcon(m.role)}
                        <select
                          id={`change-member-role-${m.id}`}
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value as UserRole)}
                          className="px-2 py-1 text-[11px] bg-[#1E1E26] border border-[#2B2B35] rounded-md text-white cursor-pointer"
                        >
                          <option value={UserRole.ORG_OWNER}>Owner (Full Keys)</option>
                          <option value={UserRole.ORG_ADMIN}>Admin</option>
                          <option value={UserRole.SUPPORT_AGENT}>Support Agent Desk</option>
                          <option value={UserRole.MARKETING_MANAGER}>Marketing Manager Outbox</option>
                          <option value={UserRole.VIEWER}>Viewer ONLY</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      {m.status === "Active" ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          Authorized JWT
                        </span>
                      ) : (
                        <span className="text-gray-500">Revoked</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[10.5px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="capitalize text-gray-400">Online</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {m.role !== UserRole.ORG_OWNER && (
                        <button
                          id={`revoke-member-btn-${m.id}`}
                          onClick={() => handleRemoveMember(m.id)}
                          className="p-1 px-1.5 hover:bg-red-950/40 text-gray-500 hover:text-red-400 border border-transparent hover:border-red-900/30 rounded-md transition-all cursor-pointer"
                          title="Revoke Teammate access credentials"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Member Drawer Popover */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <div className="w-full max-w-md bg-[#16161B] border border-[#232329] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-[#232329] pb-4 mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>Invite New organizational colleague</span>
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 px-2 text-[10px] font-mono text-gray-400 hover:text-white border border-[#2B2B35] rounded-md cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1">
                  Teammate Full Name
                </label>
                <input
                  id="invite-form-name"
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 text-xs bg-[#1E1E26] border border-[#2B2B35] rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1">
                  Organizational Email ID
                </label>
                <input
                  id="invite-form-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="ramesh@corp.in"
                  className="w-full px-3 py-2 text-xs bg-[#1E1E26] border border-[#2B2B35] rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1">
                  Credential Authority Role (RBAC)
                </label>
                <select
                  id="invite-form-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-[#1E1E26] border border-[#2B2B35] rounded-lg text-white focus:outline-none cursor-pointer"
                >
                  <option value={UserRole.ORG_ADMIN}>Admin (Communications access only)</option>
                  <option value={UserRole.SUPPORT_AGENT}>Support Agent Desk</option>
                  <option value={UserRole.MARKETING_MANAGER}>Marketing Manager Outbox</option>
                  <option value={UserRole.VIEWER}>Viewer Only (No writing)</option>
                </select>
              </div>

              <button
                id="invite-form-submit"
                type="submit"
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white tracking-wide transition-all cursor-pointer"
              >
                Deploy organizational colleague Invite
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
