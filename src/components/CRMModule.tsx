/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Contact, User } from "../types";
import { 
  Search, Filter, Plus, FileSpreadsheet, Download, 
  Trash2, Mail, Phone, Calendar, UserPlus, FileText, CheckCircle, XCircle 
} from "lucide-react";

interface CRMModuleProps {
  user: User;
}

export default function CRMModule({ user }: CRMModuleProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("All");
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Add Contact Form State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSegment, setFormSegment] = useState<Contact["segment"]>("Leads");
  const [formTags, setFormTags] = useState("");
  const [formConsent, setFormConsent] = useState(true);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (searchTerm) q.append("search", searchTerm);
      if (selectedSegment !== "All") q.append("segment", selectedSegment);
      
      const res = await fetch(`/api/contacts?${q.toString()}`);
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (e) {
      console.error("Contacts loading timeout", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [searchTerm, selectedSegment]);

  const handleAddNotes = async (contactId: string) => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch(`/api/contacts/${contactId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteText: newNote })
      });
      const data = await res.json();
      setNewNote("");
      // Update local view
      setContacts(prev => prev.map(c => c.id === contactId ? data.contact : c));
      setActiveContact(data.contact);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    try {
      const contactObj = {
        name: formName,
        phone: formPhone,
        email: formEmail,
        segment: formSegment,
        tags: formTags.split(",").map(t => t.trim()).filter(Boolean),
        optInStatus: formConsent,
        spamRiskScore: Math.floor(Math.random() * 25)
      };

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactObj)
      });
      const data = await res.json();
      
      // Close modal and reset state
      setIsAddingContact(false);
      setFormName("");
      setFormPhone("");
      setFormEmail("");
      setFormTags("");
      setFormConsent(true);
      
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this contact under Right-to-be-Forgotten?")) return;
    try {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (activeContact?.id === id) setActiveContact(null);
      fetchContacts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadCSV = () => {
    if (contacts.length === 0) {
      alert("No contacts in the current view to export.");
      return;
    }

    const escapeCSVValue = (val: any) => {
      const stringified = val === null || val === undefined ? "" : String(val);
      if (stringified.includes(",") || stringified.includes('"') || stringified.includes("\n") || stringified.includes("\r")) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const headers = ["ID", "Name", "Phone", "Email", "Segment", "Tags", "Consent Status", "Spam Risk Score %", "Record Created"];
    const rows = contacts.map(c => [
      c.id,
      c.name,
      c.phone,
      c.email || "",
      c.segment,
      c.tags.join(", "),
      c.optInStatus ? "OPT-IN" : "REVOKED",
      `${c.spamRiskScore}%`,
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.map(escapeCSVValue).join(","),
      ...rows.map(row => row.map(escapeCSVValue).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `comms_crm_filtered_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track in audit log
    fetch("/api/privacy/consent-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactId: contacts[0]?.id || "crm_root",
        type: "analytics",
        action: "grant",
        source: `CRM Filtered List Download CSV: ${contacts.length} entries (Search: "${searchTerm}", Segment: "${selectedSegment}")`
      })
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#fafafa]">
      {/* Module Title Banner */}
      <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4 border-b border-white/10 bg-[#09090b]/50 backdrop-blur-sm p-6 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">CRM & Contact Intelligence</h1>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Segment customers, tag preferences, log manual timeline interactions, and track opt-in consent structures.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="export-csv-btn"
            onClick={handleDownloadCSV}
            className="px-3 py-1.5 bg-[#18181b]/60 hover:bg-[#27272a]/60 border border-white/10 hover:border-indigo-500/30 rounded-lg text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Download CSV</span>
          </button>
          <button
            id="add-contact-btn"
            onClick={() => setIsAddingContact(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-500/15"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Contact</span>
          </button>
        </div>
      </div>

      {/* Internal working space split-grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Contact list side */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto scrollbar-thin">
          {/* Controls belt */}
          <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-4 h-4 text-zinc-500" />
              </span>
              <input
                id="search-contacts"
                type="text"
                placeholder="Search name, phone, tags, segments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#18181b]/60 border border-white/10 focus:border-indigo-500/50 rounded-lg text-white focus:outline-none placeholder:text-zinc-500 font-sans"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Segment filter:</span>
              <div className="flex items-center gap-1 bg-[#18181b]/60 border border-white/10 p-0.5 rounded-lg">
                {["All", "Leads", "Premium Users", "Inactive Users", "Re-engagement", "Trial Users"].map((seg) => (
                  <button
                    id={`segment-tab-${seg.replace(/\s+/g, '-').toLowerCase()}`}
                    key={seg}
                    onClick={() => setSelectedSegment(seg)}
                    className={`px-3 py-1 text-[10px] rounded-md transition-all font-medium cursor-pointer ${
                      selectedSegment === seg ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {seg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center p-12 text-xs text-zinc-500 font-mono">
              Fetching relational contact indexes...
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-xl bg-[#18181b]/20">
              <FileSpreadsheet className="w-10 h-10 text-zinc-600 mb-2 animate-bounce" />
              <p className="text-xs text-zinc-400 font-medium font-mono">No contact directories found matching parameters.</p>
              <button
                onClick={() => { setSearchTerm(""); setSelectedSegment("All"); }}
                className="mt-3 text-[10px] font-mono text-indigo-400 hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="glass-card overflow-hidden shadow-2xl">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Segment / Tags</th>
                    <th className="p-4">Compliance Opt-In</th>
                    <th className="p-4">Spam Risk</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        activeContact?.id === contact.id ? "bg-indigo-600/10" : ""
                      }`}
                      onClick={() => setActiveContact(contact)}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-white text-sm">{contact.name}</div>
                        <div className="flex items-center gap-1.5 text-zinc-400 mt-1 font-mono text-[10px]">
                          <Phone className="w-3" />
                          <span>{contact.phone}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="mb-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            contact.segment === "Premium Users"
                              ? "bg-purple-950/30 border-purple-800/50 text-purple-300"
                              : contact.segment === "Leads"
                              ? "bg-indigo-950/30 border-indigo-805/50 text-indigo-300"
                              : contact.segment === "Inactive Users"
                              ? "bg-zinc-900 border-zinc-700/50 text-zinc-450"
                              : contact.segment === "Re-engagement"
                              ? "bg-amber-950/30 border-amber-801/50 text-amber-300"
                              : "bg-emerald-950/30 border-emerald-805/50 text-emerald-300"
                          }`}>
                            {contact.segment}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((tag) => (
                            <span key={tag} className="px-1.5 py-0.2 bg-white/5 border border-white/5 rounded text-[9px] text-[#A0A0B5]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        {contact.optInStatus ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>OPT-IN</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>REVOKED</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-[11px]">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full ${contact.spamRiskScore > 35 ? "bg-red-500" : contact.spamRiskScore > 15 ? "bg-amber-500" : "bg-emerald-500"}`} 
                              style={{ width: `${Math.min(100, contact.spamRiskScore * 2)}%` }}
                            />
                          </div>
                          <span className="text-zinc-400 text-[10px]">{contact.spamRiskScore}%</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-zinc-500 text-nowrap">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`delete-contact-${contact.id}`}
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1 px-1.5 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-900/30 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Timeline Active Contact Drawer */}
        {activeContact && (
          <div className="w-96 shrink-0 bg-[#09090b]/90 border-l border-white/10 flex flex-col h-full overflow-hidden font-sans">
            {/* Header panel */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
              <div className="overflow-hidden">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Customer Profile</div>
                <h3 className="text-base font-bold text-white truncate mt-0.5">{activeContact.name}</h3>
                <div className="text-xs text-zinc-400 mt-1 font-mono">{activeContact.phone}</div>
              </div>
              <button
                onClick={() => setActiveContact(null)}
                className="text-[10px] font-mono p-1 px-2 hover:bg-white/5 text-zinc-400 border border-white/10 rounded-md transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>

            {/* Scrolling Timeline content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* Interaction activities logs */}
              <div>
                <legend className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Communication Timeline</legend>
                <div className="relative pl-4 border-l-2 border-white/5 space-y-4">
                  {activeContact.activities && activeContact.activities.map((act) => (
                    <div key={act.id} className="relative">
                      {/* bullet node */}
                      <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border border-[#09090b] bg-indigo-500 shadow" />
                      <div className="text-xs font-semibold text-zinc-300">{act.title}</div>
                      <div className="text-[11px] text-zinc-450 mt-0.5">{act.details}</div>
                      <div className="text-[9px] font-mono text-zinc-500 mt-1">
                        {new Date(act.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Notes log list */}
              <div>
                <legend className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">CRM Notes ({activeContact.notes?.length || 0})</legend>
                <div className="space-y-3 mb-3">
                  {activeContact.notes && activeContact.notes.map((note) => (
                    <div key={note.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-indigo-400 font-mono mb-1">
                        <span>{note.author}</span>
                        <span className="text-zinc-500 font-light">{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-zinc-305 italic">"{note.text}"</p>
                    </div>
                  ))}
                  {(!activeContact.notes || activeContact.notes.length === 0) && (
                    <div className="text-center p-3 text-xs text-zinc-500 italic font-mono bg-white/[0.01] border border-dashed border-white/5 rounded-lg">
                      No team annotations recorded yet.
                    </div>
                  )}
                </div>

                {/* Notes Input Area */}
                <div className="flex gap-1.5 font-sans">
                  <input
                    id="new-note-text"
                    type="text"
                    placeholder="Append staff annotation notes..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 bg-[#18181b]/60 border border-white/10 focus:outline-none focus:border-indigo-500/50 rounded-lg text-white"
                  />
                  <button
                    id="submit-note-btn"
                    onClick={() => handleAddNotes(activeContact.id)}
                    className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Record New Contact Drawer Modal */}
      {isAddingContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#16161B] border border-[#232329] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-[#232329] pb-4 mb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>Initialize Outbound Contact Profile</span>
              </h3>
              <button
                onClick={() => setIsAddingContact(false)}
                className="p-1 px-2 text-[10px] font-mono text-gray-400 hover:text-white hover:bg-[#1E1E26] border border-[#2B2B35] rounded-md transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                  Full Customer Name
                </label>
                <input
                  id="form-contact-name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Priyanjali S."
                  className="w-full px-3 py-2 text-xs bg-[#1E1E26] border border-[#2B2B35] rounded-lg text-white focus:outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                    Phone (with Code)
                  </label>
                  <input
                    id="form-contact-phone"
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full px-3 py-2 text-xs bg-[#1E1E26] border border-[#2B2B35] rounded-lg text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    id="form-contact-email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="priya@corp.in"
                    className="w-full px-3 py-2 text-xs bg-[#1E1E26] border border-[#2B2B35] rounded-lg text-white focus:outline-none font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                    Primary Segment
                  </label>
                  <select
                    id="form-contact-segment"
                    value={formSegment}
                    onChange={(e) => setFormSegment(e.target.value as Contact["segment"])}
                    className="w-full px-3 py-2 text-xs bg-[#1E1E26] border border-[#2B2B35] rounded-lg text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Leads">Leads (Marketing Focus)</option>
                    <option value="Premium Users">Premium (VIP Priority)</option>
                    <option value="Inactive Users">Inactive (Win-Back Queue)</option>
                    <option value="Re-engagement">Re-engagement</option>
                    <option value="Trial Users">Trial Users</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                    Tags (Comma Split)
                  </label>
                  <input
                    id="form-contact-tags"
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="saas, metal, lead-v3"
                    className="w-full px-3 py-2 text-xs bg-[#1E1E26] border border-[#2B2B35] rounded-lg text-white focus:outline-none font-sans"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#1E1E26] border border-[#2B2B35] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300">Compliance Opt-In Consent</label>
                    <p className="text-[9px] text-[#5C5C6E] mt-0.5 font-mono">Explicit consent recorded for Bulk SMS and WhatsApp broadcasts.</p>
                  </div>
                  <input
                    id="form-contact-consent"
                    type="checkbox"
                    checked={formConsent}
                    onChange={(e) => setFormConsent(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-[#1E1E26] border-[#2B2B35] rounded cursor-pointer"
                  />
                </div>
              </div>

              <button
                id="form-submit-contact"
                type="submit"
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold text-white tracking-wide transition-all cursor-pointer"
              >
                Write Outbound Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
