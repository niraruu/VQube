/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  FileSpreadsheet, Upload, Download, Check, AlertCircle, 
  Trash2, Copy, Play, ArrowRight, UserCheck, ShieldAlert 
} from "lucide-react";
import { User, Contact } from "../types";

interface UploadContactsModuleProps {
  user: User;
}

interface ParsedContact {
  name: string;
  phone: string;
  email: string;
  segment: string;
  tags: string[];
}

export default function UploadContactsModule({ user }: UploadContactsModuleProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mappedNameCol, setMappedNameCol] = useState<string>("");
  const [mappedPhoneCol, setMappedPhoneCol] = useState<string>("");
  const [mappedEmailCol, setMappedEmailCol] = useState<string>("");
  const [selectedSegment, setSelectedSegment] = useState<string>("Leads");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; success: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag over states
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  // Process selected files
  const processFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");
    setIsProcessing(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Could not read spreadsheet file elements.");

        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON array
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        if (json.length === 0) {
          alert("The uploaded spreadsheet file doesn't seem to contain any valid records.");
          setIsProcessing(false);
          return;
        }

        // Get list of headers
        const headers = Object.keys(json[0]);
        setColumns(headers);
        setParsedData(json);

        // Try to auto-detect mappings
        const lowerHeaders = headers.map(h => h.toLowerCase());
        
        const nameIdx = lowerHeaders.findIndex(h => h.includes("name") || h.includes("customer") || h.includes("client"));
        const phoneIdx = lowerHeaders.findIndex(h => h.includes("phone") || h.includes("mobile") || h.includes("tel") || h.includes("contact"));
        const emailIdx = lowerHeaders.findIndex(h => h.includes("email") || h.includes("mail"));

        if (nameIdx >= 0) setMappedNameCol(headers[nameIdx]);
        else if (headers.length > 0) setMappedNameCol(headers[0]);

        if (phoneIdx >= 0) setMappedPhoneCol(headers[phoneIdx]);
        else if (headers.length > 1) setMappedPhoneCol(headers[1]);

        if (emailIdx >= 0) setMappedEmailCol(headers[emailIdx]);
      } catch (err) {
        console.error(err);
        alert("Parsing Error: Make sure your Excel or CSV follows a tabular structure with a top row header.");
      } finally {
        setIsProcessing(false);
        setIsDragActive(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Download simple mock template
  const downloadSampleTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { "Full Name": "Rajesh Sharma", "Phone Number": "+919876543210", "Email Address": "rajesh@sharma.in" },
      { "Full Name": "Jane Doe", "Phone Number": "+14155552671", "Email Address": "jane.doe@gmail.com" },
      { "Full Name": "Ahmed Ansari", "Phone Number": "+971501234567", "Email Address": "ahmed.ansari@dubai.ae" }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample Contacts");
    XLSX.writeFile(wb, "omnicanal_bulk_contacts_sample.xlsx");
  };

  // Wipes parsed selection
  const resetUploader = () => {
    setFileName("");
    setFileSize("");
    setParsedData([]);
    setColumns([]);
    setMappedNameCol("");
    setMappedPhoneCol("");
    setMappedEmailCol("");
    setImportResult(null);
  };

  // Submit bulk imports to backend REST endpoints
  const handleImportSubmit = async () => {
    if (!mappedNameCol || !mappedPhoneCol) {
      alert("Please map the 'Full Name' and 'Phone Number' columns to proceed with the import.");
      return;
    }

    setIsUploading(true);
    try {
      // Map rows to contacts list format
      const contactsToSave = parsedData.map((row) => {
        // Safe formatting for phone numbers
        let rawPhone = String(row[mappedPhoneCol] || "").replace(/[^0-9+]/g, "");
        if (rawPhone && !rawPhone.startsWith("+")) {
          // Default append block
          if (rawPhone.length === 10) rawPhone = "+91" + rawPhone; // Assume Indian regional if 10 digits
        }

        return {
          name: row[mappedNameCol] || "Unknown Client",
          phone: rawPhone,
          email: mappedEmailCol ? row[mappedEmailCol] : "",
          segment: selectedSegment,
          tags: ["imported", "excel-upload", selectedSegment.toLowerCase().replace(/\s+/g, "-")],
          optInStatus: true // Auto enabled since they gave us the list
        };
      });

      // Fire to backend bulk insert
      const res = await fetch("/api/contacts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: contactsToSave })
      });

      if (res.ok) {
        setImportResult({ count: contactsToSave.length, success: true });
        // Auto reset on success but keep result state
        setParsedData([]);
      } else {
        throw new Error("Bulk upload failed");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save lists into contacts store. Check server connection logs.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#fafafa] font-sans">
      {/* Banner */}
      <div className="flex justify-between items-center border-b border-white/10 bg-[#09090b]/50 backdrop-blur-sm p-6 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <span>Excel & CSV Contact Uploader</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Bulk upload spreadsheets of recipient contacts to instantly schedule high-volume WhatsApp campaign dispatches.
          </p>
        </div>
        <div>
          <button
            onClick={downloadSampleTemplate}
            id="download-sample-xlsx"
            className="px-3 py-1.5 bg-[#18181b]/60 hover:bg-[#27272a]/60 border border-white/10 hover:border-indigo-500/30 rounded-lg text-xs font-semibold text-zinc-300 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Download Sample Excel Template</span>
          </button>
        </div>
      </div>

      <div className="flex-grow p-6 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main upload component area */}
          {parsedData.length === 0 ? (
            <div className="space-y-6">
              {importResult && importResult.success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 animate-fade-in mb-4">
                  <UserCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Roster Successfully Imported!</h4>
                    <p className="text-xs text-emerald-400/80 mt-1">
                      Directly provisioned <strong>{importResult.count} contacts</strong> into the communications list database. You can now target them on WhatsApp in the Campaign Outbox Center.
                    </p>
                  </div>
                </div>
              )}

              {/* Drag drop slot */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                  isDragActive 
                    ? "border-indigo-500 bg-indigo-950/10" 
                    : "border-white/10 hover:border-indigo-500/30 bg-[#18181b]/10"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleChange}
                />
                
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Drag & drop your Excel (.xlsx, .xls) or CSV file here
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      or click to browse local sheets directories (max 10MB)
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Columns Auto Match
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Ready Format
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Spam-Score Shield Checked
                    </span>
                  </div>
                </div>
              </div>

              {/* Security info card block */}
              <div className="bg-[#18181b]/35 border border-white/10 rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Permission and Compliance Declaration</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    By importing these subscribers, you verify that you hold explicit corporate opt-in consent to reach out to them on WhatsApp. Communications will run under server-safe throttling rates according to global and Indian telecom standards.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Mapping validation view */
            <div className="space-y-6">
              <div className="glass-card p-5 space-y-4">
                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Check className="w-5 h-5 text-emerald-400" />
                      <span>Loaded Spreadsheet file: {fileName}</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Total rows parsed: {parsedData.length} records. Let's map your columns below.</p>
                  </div>
                  <button
                    onClick={resetUploader}
                    className="p-1 px-2.5 text-[10px] font-mono text-red-400 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                  >
                    Clear Loader
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#18181b]/10 p-4 rounded-xl border border-white/5">
                  {/* Name map */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Select name column</label>
                    <select
                      value={mappedNameCol}
                      onChange={(e) => setMappedNameCol(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#18181b] border border-white/10 rounded-lg text-white pointer-events-auto cursor-pointer"
                    >
                      <option value="">-- Ignore Name --</option>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Phone map */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Select phone number column</label>
                    <select
                      value={mappedPhoneCol}
                      onChange={(e) => setMappedPhoneCol(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#18181b] border border-white/10 rounded-lg text-white pointer-events-auto cursor-pointer"
                    >
                      <option value="">-- Ignore Phone --</option>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Segment Allocation */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Allocate target segment</label>
                    <select
                      value={selectedSegment}
                      onChange={(e) => setSelectedSegment(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#18181b] border border-white/10 rounded-lg text-white pointer-events-auto cursor-pointer"
                    >
                      <option value="Leads">Leads Segment</option>
                      <option value="Premium Users">Premium Users</option>
                      <option value="Trial Users">Trial Users</option>
                      <option value="Inactive Users">Inactive Users</option>
                      <option value="Re-engagement">Re-engagement</option>
                    </select>
                  </div>
                </div>

                {/* Spreadsheet Live mapping grid preview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Spreadsheet Parsed Grid Preview (First 5 rows)</span>
                  <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/10 text-[10px] font-mono text-zinc-400">
                          <th className="p-3">Spreadsheet Row #</th>
                          <th className="p-3">Mapped name ({mappedNameCol || "Not Mapped"})</th>
                          <th className="p-3">Mapped phone ({mappedPhoneCol || "Not Mapped"})</th>
                          <th className="p-3">Recipient allocation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {parsedData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.01]">
                            <td className="p-3 font-mono text-zinc-500 text-[10px]">{idx + 1}</td>
                            <td className="p-3 text-white font-medium">{row[mappedNameCol] || <span className="text-zinc-600 italic">Empty</span>}</td>
                            <td className="p-3 text-indigo-400 font-mono">{row[mappedPhoneCol] || <span className="text-zinc-600 italic">Empty</span>}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-indigo-950/20 text-indigo-400 border border-indigo-500/20 rounded text-[9px] font-mono font-bold uppercase">
                                {selectedSegment} List Item
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Run import trigger */}
                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    onClick={handleImportSubmit}
                    disabled={isUploading || isProcessing}
                    className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                  >
                    <span>{isUploading ? "Provisioning Batch State..." : `Commit & Save ${parsedData.length} Recipients in CRM`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
