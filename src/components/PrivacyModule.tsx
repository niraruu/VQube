/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Contact } from "../types";
import { 
  ShieldCheck, AlertTriangle, Search, CheckSquare, 
  UserCheck, ShieldAlert, History, KeyRound, AlertCircle
} from "lucide-react";

interface PrivacyModuleProps {
  user: User;
}

export default function PrivacyModule({ user }: PrivacyModuleProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Consent attestation checkboxes for the specific customer we are reaching out to
  const [hasLegalRelationship, setHasLegalRelationship] = useState(false);
  const [hasExplicitOptIn, setHasExplicitOptIn] = useState(false);
  const [isNotOnDoNotDisturb, setIsNotOnDoNotDisturb] = useState(false);
  
  const [attestationHistory, setAttestationHistory] = useState<Array<{
    id: string;
    phone: string;
    name: string;
    attester: string;
    timestamp: string;
    status: "AUTHORIZED" | "REVOKED";
  }>>([
    { id: "att-1", phone: "+919876543210", name: "Rajesh Kumar", attester: "Nirjara Jain", timestamp: new Date(Date.now() - 3600000).toISOString(), status: "AUTHORIZED" },
    { id: "att-2", phone: "+14155552671", name: "Esther Howard", attester: "Nirjara Jain", timestamp: new Date(Date.now() - 7200000).toISOString(), status: "AUTHORIZED" }
  ]);

  const loadContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone) {
      setSelectedContact(null);
      return;
    }
    const sanitized = searchPhone.replace(/[^0-9+]/g, "");
    const found = contacts.find(c => 
      c.phone.replace(/[^0-9+]/g, "").includes(sanitized) || 
      c.name.toLowerCase().includes(searchPhone.toLowerCase())
    );
    if (found) {
      setSelectedContact(found);
      // Reset checkboxes
      setHasLegalRelationship(found.optInStatus);
      setHasExplicitOptIn(found.optInStatus);
      setIsNotOnDoNotDisturb(true);
    } else {
      setSelectedContact(null);
      alert("No active contact found with this criteria. Make sure to add them first in the Contacts section.");
    }
  };

  const handleRegisterConsent = async () => {
    if (!selectedContact) return;
    
    // Check if they confirmed they checked everything
    if (!hasLegalRelationship || !hasExplicitOptIn || !isNotOnDoNotDisturb) {
      alert("Please confirm all three key compliance criteria to register this contact's consent.");
      return;
    }

    try {
      // Post validation log to audit logs
      const logRes = await fetch("/api/privacy/consent-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: selectedContact.id,
          type: "marketing",
          action: "grant",
          source: `Verified client files & registered explicit consent prior outbound campaign dispatch`
        })
      });

      if (logRes.ok) {
        // Log locally
        const newAttestation = {
          id: "att-" + Date.now(),
          phone: selectedContact.phone,
          name: selectedContact.name,
          attester: user.fullName,
          timestamp: new Date().toISOString(),
          status: "AUTHORIZED" as const
        };
        setAttestationHistory(prev => [newAttestation, ...prev]);
        
        // Save back opt in status
        await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...selectedContact,
            optInStatus: true
          })
        });

        alert(`Consent recorded successfully! "${selectedContact.name}" is now cleared to receive automated messages.`);
        loadContacts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#fafafa] font-sans">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-white/10 bg-[#09090b]/50 backdrop-blur-sm p-6 sticky top-0 z-10 font-sans">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Customer Consent Verification</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Verify and record customer permission. Ensure you have brand and legal approval before starting automated messages.
          </p>
        </div>
      </div>

      <div className="flex-grow p-6 flex flex-col lg:flex-row gap-6 overflow-y-auto scrollbar-thin">
        {/* Left Side: Specific Lookup & Validation Questionnaire Form */}
        <div className="flex-1 space-y-6">
          <div className="glass-card p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-white">1. Locate Recipient Contact</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Search by phone number or name to review active contact permission details.</p>
            </div>

            <form onSubmit={handlePhoneSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. +919876543210 or Rajesh"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#18181b]/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50 placeholder-zinc-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-600 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all shrink-0"
              >
                Search Contacts
              </button>
            </form>

            {selectedContact ? (
              <div className="p-4 bg-indigo-950/10 border border-indigo-550/10 rounded-xl space-y-3 animate-fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-semibold text-white">{selectedContact.name}</h4>
                    <p className="text-[10px] font-mono text-indigo-400 mt-0.5">{selectedContact.phone}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    selectedContact.optInStatus ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {selectedContact.optInStatus ? "VERIFIED OK" : "NO RECORDED CONSENT"}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-3 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="opt-relationship-check"
                      type="checkbox"
                      checked={hasLegalRelationship}
                      onChange={(e) => setHasLegalRelationship(e.target.checked)}
                      className="w-4 h-4 rounded mt-0.5 shrink-0 bg-zinc-800 border-zinc-700 text-indigo-650 cursor-pointer"
                    />
                    <label htmlFor="opt-relationship-check" className="text-xs text-zinc-300 leading-normal cursor-pointer select-none">
                      <strong>Client Relationship:</strong> I confirm we have a legitimate business relationship with <span className="text-white font-medium">{selectedContact.name}</span>.
                    </label>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <input
                      id="opt-consent-check"
                      type="checkbox"
                      checked={hasExplicitOptIn}
                      onChange={(e) => setHasExplicitOptIn(e.target.checked)}
                      className="w-4 h-4 rounded mt-0.5 shrink-0 bg-zinc-800 border-zinc-700 text-indigo-655 cursor-pointer"
                    />
                    <label htmlFor="opt-consent-check" className="text-xs text-zinc-300 leading-normal cursor-pointer select-none">
                      <strong>Explicit Message Consent:</strong> I attest that this user has agreed and requested to receive notifications or updates over WhatsApp.
                    </label>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <input
                      id="opt-dnd-check"
                      type="checkbox"
                      checked={isNotOnDoNotDisturb}
                      onChange={(e) => setIsNotOnDoNotDisturb(e.target.checked)}
                      className="w-4 h-4 rounded mt-0.5 shrink-0 bg-zinc-800 border-zinc-700 text-indigo-655 cursor-pointer"
                    />
                    <label htmlFor="opt-dnd-check" className="text-xs text-zinc-300 leading-normal cursor-pointer select-none">
                      <strong>No Unsubscribe Request:</strong> I guarantee that this phone number has not requested to opt out or stop receiving brand messages.
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-end">
                  <button
                    onClick={handleRegisterConsent}
                    className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-600 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all"
                  >
                    Register Customer Consent
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-white/15 rounded-xl p-8 text-center text-xs text-zinc-500 italic">
                Enter a subscriber name or phone number query above to check client permissions.
              </div>
            )}
          </div>

          {/* Compliance Info Banner */}
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-5 flex gap-3 text-xs leading-relaxed font-sans">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Important Privacy Shield Notice</strong>
              Make sure that contacts have given you permission before launching bulk campaigns. Consent logs are automatically recorded to protect customer choices and follow brand rules.
            </div>
          </div>
        </div>

        {/* Right Side: Ledger history of verified attestations */}
        <div className="w-full lg:w-96 bg-[#0c0c0e] border border-white/10 rounded-2xl flex flex-col h-110 lg:h-auto overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/[0.01]/40 flex items-center gap-1.5">
            <History className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Consent Audit History</span>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {attestationHistory.map((item) => (
              <div key={item.id} className="p-3 bg-[#18181b]/40 border border-white/5 rounded-lg space-y-1 hover:border-zinc-800 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-white truncate max-w-[150px]">{item.name}</span>
                  <span className="px-2 py-0.2 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-mono font-bold">
                    {item.status}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">Phone: {item.phone}</div>
                <div className="text-[10px] text-zinc-500">Verified by: {item.attester}</div>
                <div className="text-[9px] font-mono text-zinc-600 text-right">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
