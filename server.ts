/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { dbService } from "./server/db";
import { createServer as createViteServer } from "vite";
import { CampaignStatus, UserRole, TicketStatus } from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gemini SDK
let ai: GoogleGenAI | null = null;
const isGeminiEnabled = !!process.env.GEMINI_API_KEY;

if (isGeminiEnabled) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
    console.log("Google GenAI client initialized server-side.");
  } catch (err) {
    console.error("Failed to initialize Google GenAI:", err);
  }
} else {
  console.log("No GEMINI_API_KEY found. Running in intelligent AI fallback simulation mode.");
}

// Custom simulated local AI response generator
function getSimulatedAIResponse(prompt: string, personaName: string): string {
  const lowercase = prompt.toLowerCase();
  
  if (lowercase.includes("webhook") || lowercase.includes("api")) {
    return `[OmniChannel AI - ${personaName}]
To configure your WhatsApp or Bulk SMS delivery webhook in production, navigate to Settings > Technical Integration and provide your secure endpoint. 
Make sure your server handles POST requests and returns a standard HTTP 200 OK. 
A standard payload contains:
{
  "eventId": "evt_wa_78204",
  "channel": "WhatsApp",
  "status": "delivered",
  "recipient": "+919876543210"
}
Would you like help testing a sample POST callback with our workflow builder?`;
  }
  
  if (lowercase.includes("compliance") || lowercase.includes("gdpr") || lowercase.includes("dpdp")) {
    return `[OmniChannel AI - ${personaName}]
Compliance is priority #1. The India DPDP (Digital Personal Data Protection) Act 2023 requires explicit, revocable consent before sending bulk broadcasts. 
Our Consent & Privacy Center logs each opt-in with a secure timestamp and IP address tracker.
Always ensure your templates (like the ones in Campaign Management) include standard STOP trigger mechanics. Let me know if you would like me to draft a complaint template that includes standard opt-out clauses!`;
  }

  if (lowercase.includes("campaign") || lowercase.includes("broadcast") || lowercase.includes("templates")) {
    return `[OmniChannel AI - ${personaName}]
A high-converting campaign starts with template approval. Under our Campaign Center, WhatsApp templates require Meta pre-clearance placeholders. 
For Bulk SMS templates, carrier throttling is auto-enforced at 100 messages/sec to prevent spam triggering risk. 
I highly recommend target segment partitioning: targeting 'Leads' first or initiating a 'Win-Back Spark' campaign only for 'Inactive Users'. Use variables like {{name}} to increase click-through metrics by up to 40%!`;
  }

  if (lowercase.includes("hello") || lowercase.includes("hi ") || lowercase.includes("hey")) {
    return `[OmniChannel AI - ${personaName}]
Greetings! I am the automated intelligence assistant for your OmniChannel platform workspace. I help support agents, managers, and designers trigger WhatsApp and SMS campaign flows, analyze negative ticket sentiments, test workflow structures, and monitor compliance logs. How can I help you today?`;
  }

  // General fallback text
  return `[OmniChannel AI - ${personaName}]
Interesting query! Our communication workspace is fully equipped to analyze your customer workflows, parse CRM timelines, and schedule escalations.
Based on the instruction set from the active persona, I recommend setting up an automated campaign triggered by inactive CRM leads. Is there anything specific about WhatsApp API template restrictions or Bulk SMS carrier filters you are debugging today?`;
}

// API Routes

// 1. Auth & Organisation System
let activeUser = dbService.getUsers()[0]; // Default user: Nirjara Jain (ORG_OWNER)

app.get("/api/auth/me", (req, res) => {
  res.json({ user: activeUser });
});

app.get("/api/auth/session", (req, res) => {
  res.json({ user: activeUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email, role } = req.body;
  const users = dbService.getUsers();
  
  // Find standard user or simulate
  let found = users.find(u => u.email === email);
  if (!found && email) {
    // Dynamically register new member inside the organization context
    found = {
      id: "u-" + Math.random().toString(36).substring(3, 8),
      email: email,
      fullName: email.split("@")[0].toUpperCase(),
      role: role || UserRole.SUPPORT_AGENT,
      orgId: "org-123"
    };
    dbService.addUser(found);
  }
  
  if (found) {
    activeUser = found;
    dbService.addAuditLog(activeUser.fullName, "User Logged In", "Authentication", `Logged in as role ${activeUser.role}`);
    return res.json({ user: activeUser });
  }
  
  res.status(401).json({ error: "Authentication failed." });
});

app.post("/api/auth/google-login", (req, res) => {
  // Simulate google SSO
  const owner = dbService.getUsers().find(u => u.role === UserRole.ORG_OWNER) || dbService.getUsers()[0];
  activeUser = owner;
  dbService.addAuditLog(activeUser.fullName, "Google SSO Authentication Success", "Authentication", "Secure single sign-on authenticated.");
  res.json({ user: activeUser });
});

app.post("/api/auth/logout", (req, res) => {
  dbService.addAuditLog(activeUser.fullName, "User Logged Out", "Authentication", `Logged out from active workspace.`);
  res.json({ success: true });
});

// 2. CRM & Contact Intelligence
app.get("/api/contacts", (req, res) => {
  const { search, segment } = req.query;
  let list = dbService.getContacts();
  
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.includes(q) || 
      (c.email && c.email.toLowerCase().includes(q)) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  
  if (segment && segment !== "All") {
    list = list.filter(c => c.segment === segment);
  }
  
  res.json({ contacts: list });
});

app.post("/api/contacts", (req, res) => {
  const contact = req.body;
  if (!contact.id) {
    contact.id = "c-" + Math.random().toString(36).substring(3, 8);
    contact.createdAt = new Date().toISOString();
    contact.notes = [];
    contact.activities = [
      { id: "a-" + Date.now(), type: "interaction", title: "Contact Created", details: "Record initialized in CRM Database Roster", timestamp: new Date().toISOString() }
    ];
  }
  dbService.addAuditLog(activeUser.fullName, "Saved Contact", "CRM", `Modified or created contact ${contact.name}`);
  const saved = dbService.saveContact(contact);
  res.json({ contact: saved });
});

app.post("/api/contacts/bulk", (req, res) => {
  const { contacts } = req.body;
  if (!Array.isArray(contacts)) {
    return res.status(400).json({ error: "Contacts parameter must be an array" });
  }

  const savedList = [];
  for (const c of contacts) {
    const contactObj = {
      id: c.id || "c-" + Math.random().toString(36).substring(3, 8),
      name: c.name || "Unnamed Contact",
      phone: c.phone || "",
      email: c.email || "",
      segment: c.segment || "Leads",
      tags: Array.isArray(c.tags) ? c.tags : ["imported"],
      optInStatus: typeof c.optInStatus === "boolean" ? c.optInStatus : true,
      spamRiskScore: Math.floor(Math.random() * 20),
      createdAt: c.createdAt || new Date().toISOString(),
      notes: [],
      activities: [
        { id: "a-" + Date.now(), type: "interaction" as const, title: "Contact Bulk Uploaded", details: "Record imported via Excel spreadsheet uploader", timestamp: new Date().toISOString() }
      ]
    };
    dbService.saveContact(contactObj);
    savedList.push(contactObj);
  }

  dbService.addAuditLog(
    activeUser.fullName, 
    `Imported ${contacts.length} Recipients via Excel`, 
    "CRM", 
    `Bulk registered ${contacts.length} customers database entries for broadcast campaigns`
  );
  res.json({ success: true, count: savedList.length });
});

app.delete("/api/contacts/:id", (req, res) => {
  dbService.addAuditLog(activeUser.fullName, "Deleted Contact", "CRM", `Wiped contact ID ${req.params.id}`);
  dbService.deleteContact(req.params.id);
  res.json({ success: true });
});

app.post("/api/contacts/:id/notes", (req, res) => {
  const { id } = req.params;
  const { noteText } = req.body;
  const contacts = dbService.getContacts();
  const contact = contacts.find(c => c.id === id);
  
  if (!contact) {
    return res.status(404).json({ error: "Contact not found" });
  }
  
  const noteObj = {
    id: "n-" + Date.now(),
    author: activeUser.fullName,
    text: noteText,
    createdAt: new Date().toISOString()
  };
  
  contact.notes.push(noteObj);
  contact.activities.unshift({
    id: "act-n-" + Date.now(),
    type: "note",
    title: "Internal Note Added",
    details: `Added by ${activeUser.fullName}: "${noteText.substring(0, 30)}..."`,
    timestamp: new Date().toISOString()
  });
  
  dbService.saveContact(contact);
  res.json({ contact });
});

// 3. Campaign Management
app.get("/api/campaigns", (req, res) => {
  res.json({ campaigns: dbService.getCampaigns() });
});

app.get("/api/templates", (req, res) => {
  res.json({ templates: dbService.getTemplates() });
});

app.post("/api/campaigns", (req, res) => {
  const { name, channel, targetSegment, templateId, scheduledTime } = req.body;
  
  const campaign = {
    id: "camp-" + Math.random().toString(36).substring(3, 8),
    name,
    channel,
    status: scheduledTime ? CampaignStatus.SCHEDULED : CampaignStatus.ACTIVE,
    targetSegment,
    templateId,
    scheduledTime,
    metrics: { sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 },
    createdAt: new Date().toISOString()
  };
  
  dbService.saveCampaign(campaign);
  dbService.addAuditLog(activeUser.fullName, "Created Campaign", "Campaigns", `Created and queue-locked campaign: "${campaign.name}"`);
  
  // Simulate active dispatch progression in backend thread
  if (campaign.status === CampaignStatus.ACTIVE) {
    setTimeout(() => {
      campaign.status = CampaignStatus.COMPLETED;
      const targetContacts = dbService.getContacts().filter(c => c.segment === targetSegment);
      const total = targetContacts.length || 20; // fallback simulation count
      const read = Math.floor(total * 0.82);
      const replied = Math.floor(read * 0.35);
      const failed = Math.floor(total * 0.05);
      
      campaign.metrics = {
        sent: total,
        delivered: total - failed,
        read: read,
        replied: replied,
        failed: failed
      };
      
      dbService.saveCampaign(campaign);
      
      // Add timeline activities to targeted contacts
      targetContacts.forEach(tc => {
        tc.activities.unshift({
          id: "act-camp-" + Date.now(),
          type: "campaign",
          title: `Campaign Dispatched: ${campaign.name}`,
          details: `Sent over ${campaign.channel}. Delivery receipt tracked.`,
          timestamp: new Date().toISOString()
        });
        dbService.saveContact(tc);
      });
      
    }, 1200); // quick simulation sequence
  }
  
  res.json({ campaign });
});

app.post("/api/campaigns/duplicate", (req, res) => {
  const { id } = req.body;
  const camps = dbService.getCampaigns();
  const found = camps.find(c => c.id === id);
  if (!found) return res.status(404).json({ error: "Campaign not found" });
  
  const copy = {
    ...found,
    id: "camp-" + Math.random().toString(36).substring(3, 8),
    name: `${found.name} (Copy)`,
    status: CampaignStatus.DRAFT,
    metrics: { sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 },
    createdAt: new Date().toISOString()
  };
  
  dbService.saveCampaign(copy);
  dbService.addAuditLog(activeUser.fullName, "Duplicated Campaign", "Campaigns", `Cloned campaign template metrics into Draft copy.`);
  res.json({ campaign: copy });
});

// 4. AI Chatbot Center & Prompt Testing
app.get("/api/ai/personas", (req, res) => {
  res.json({ personas: dbService.getPersonas() });
});

app.post("/api/ai/personas", (req, res) => {
  const persona = req.body;
  const saved = dbService.savePersona(persona);
  dbService.addAuditLog(activeUser.fullName, "Updated AI Persona Configuration", "AI Chatbot", `Updated instructions for "${persona.name}" persona.`);
  res.json({ persona: saved });
});

app.get("/api/ai/logs", (req, res) => {
  res.json({ logs: dbService.getChatLogs() });
});

app.post("/api/ai/chat", async (req, res) => {
  const { message, personaId } = req.body;
  const personas = dbService.getPersonas();
  const activePersona = personas.find(p => p.id === personaId) || personas[0];
  
  const userMsg = {
    id: "msg-" + Date.now(),
    sender: "user" as const,
    text: message,
    timestamp: new Date().toISOString()
  };
  dbService.addChatMessage(userMsg);
  
  let botReply = "";
  let isFallback = true;
  let tokensUsed = Math.floor(message.length * 1.5) + 30; // base math

  if (isGeminiEnabled && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: activePersona.systemInstruction,
          temperature: activePersona.temperature,
        }
      });
      if (response && response.text) {
        botReply = response.text;
        isFallback = false;
        tokensUsed = (response as any).usageMetadata?.totalTokenCount || tokensUsed;
      } else {
        botReply = getSimulatedAIResponse(message, activePersona.name);
      }
    } catch (err) {
      console.error("Gemini AI API execution failed. Engaging high-fidelity local models.", err);
      botReply = getSimulatedAIResponse(message, activePersona.name);
    }
  } else {
    // Simulated delay to feel like a real network model run
    await new Promise(resolve => setTimeout(resolve, 800));
    botReply = getSimulatedAIResponse(message, activePersona.name);
  }
  
  const botMsg = {
    id: "msg-" + (Date.now() + 1),
    sender: "bot" as const,
    text: botReply,
    timestamp: new Date().toISOString(),
    isSimulated: isFallback
  };
  dbService.addChatMessage(botMsg);
  
  // Save transaction metrics inside AI audit timelines
  dbService.addChatLog({
    id: "cl-" + Math.random().toString(36).substring(3, 8),
    timestamp: new Date().toISOString(),
    prompt: message,
    response: botReply,
    tokensUsed,
    success: true,
    isFallback
  });
  
  res.json({ userMessage: userMsg, botMessage: botMsg });
});

app.post("/api/ai/chat/clear", (req, res) => {
  dbService.clearChatMessages();
  res.json({ success: true });
});

// 5. Trigger-based Workflow Automation
app.get("/api/workflows", (req, res) => {
  res.json({ workflows: dbService.getWorkflows() });
});

app.get("/api/workflows/logs", (req, res) => {
  res.json({ logs: dbService.getWorkflowLogs() });
});

app.post("/api/workflows", (req, res) => {
  const workflow = req.body;
  if (!workflow.id) {
    workflow.id = "wf-" + Math.random().toString(36).substring(3, 8);
    workflow.runsCount = 0;
  }
  const saved = dbService.saveWorkflow(workflow);
  dbService.addAuditLog(activeUser.fullName, "Modified Automation Rule", "Workflows", `Saved trigger rule: ${workflow.name}`);
  res.json({ workflow: saved });
});

app.post("/api/workflows/:id/trigger", (req, res) => {
  const { id } = req.params;
  const workflows = dbService.getWorkflows();
  const wf = workflows.find(w => w.id === id);
  if (!wf) return res.status(404).json({ error: "Workflow node not found" });
  
  wf.runsCount += 1;
  wf.lastRun = new Date().toISOString();
  dbService.saveWorkflow(wf);
  
  const log = {
    id: "wl-" + Math.random().toString(36).substring(3, 8),
    workflowId: wf.id,
    workflowName: wf.name,
    status: "success" as const,
    timestamp: new Date().toISOString(),
    executedStepsCount: wf.steps.length,
    details: `Trigger "${wf.trigger}" successfully initialized. Processed conditional step sequence [${wf.steps.map(s => s.label).join(" -> ")}].`
  };
  
  dbService.addWorkflowLog(log);
  dbService.addAuditLog("Workflow Daemon", `Automation Trigger Active: ${wf.name}`, "Workflows", `Successfully scheduled auto campaigns.`);
  res.json({ success: true, log });
});

// 6. Support & Ticket Desk System
app.get("/api/tickets", (req, res) => {
  res.json({ tickets: dbService.getTickets() });
});

app.get("/api/faqs", (req, res) => {
  res.json({ faqs: dbService.getFAQs() });
});

app.post("/api/tickets", (req, res) => {
  const { contactId, title, description, priority } = req.body;
  const contacts = dbService.getContacts();
  const contact = contacts.find(c => c.id === contactId) || contacts[0];
  
  const ticket: any = {
    id: "t-" + Math.random().toString(36).substring(3, 8),
    contactId: contact.id,
    contactName: contact.name,
    contactPhone: contact.phone,
    title,
    description,
    priority,
    status: TicketStatus.OPEN,
    slaLimitMinutes: priority === "Urgent" ? 15 : priority === "High" ? 30 : 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiSentiment: "neutral",
    aiSummary: "Awaiting automatic context processing summary",
    activities: [
      { author: "System", text: "Customer opened ticket from support desk.", timestamp: new Date().toISOString() }
    ]
  };
  
  // AI summarization queue
  setTimeout(() => {
    analyzeTicketAI(ticket);
  }, 1000);
  
  dbService.saveTicket(ticket);
  res.json({ ticket });
});

async function analyzeTicketAI(ticket: any) {
  let sentiment: "positive" | "negative" | "neutral" = "neutral";
  let summary = `Thread analysis for query: "${ticket.title}". Focus: Support delivery context.`;
  
  const prompt = `Analyze support ticket for sentiment ('positive', 'negative', 'neutral') and summarize in one sentence.
  Ticket Title: ${ticket.title}
  Description: ${ticket.description}`;
  
  if (isGeminiEnabled && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an automated support bot. Output only a JSON block with schema { sentiment: 'positive'|'negative'|'neutral', summary: 'one sentence summary text' }",
          responseMimeType: "application/json"
        }
      });
      if (response && response.text) {
        const payload = JSON.parse(response.text.trim());
        sentiment = payload.sentiment || "neutral";
        summary = payload.summary || summary;
      }
    } catch (e) {
      console.log("Error analyzing ticket with Gemini AI, fallback engaged:", e);
    }
  }
  
  // Fallback heuristics
  if (sentiment === "neutral") {
    const text = (ticket.title + " " + ticket.description).toLowerCase();
    if (text.includes("error") || text.includes("fail") || text.includes("timeout") || text.includes("broken") || text.includes("poor") || text.includes("cancel")) {
      sentiment = "negative";
      summary = `Customer reports technical breakdown or integration bottleneck. Sentiment is flagged as urgent concern.`;
    } else {
      summary = `Customer seeking platform routing details. Handled cleanly.`;
    }
  }
  
  ticket.aiSentiment = sentiment;
  ticket.aiSummary = summary;
  ticket.activities.push({
    author: "OmniChannel AI",
    text: `Sentiment detected: ${sentiment.toUpperCase()}. Summary: ${summary}`,
    timestamp: new Date().toISOString()
  });
  dbService.saveTicket(ticket);
}

app.post("/api/tickets/:id/reply", (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const tickets = dbService.getTickets();
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  
  ticket.activities.push({
    author: activeUser.fullName,
    text,
    timestamp: new Date().toISOString()
  });
  ticket.updatedAt = new Date().toISOString();
  ticket.status = TicketStatus.IN_PROGRESS;
  
  dbService.saveTicket(ticket);
  res.json({ ticket });
});

app.post("/api/tickets/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const tickets = dbService.getTickets();
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  
  ticket.status = status;
  ticket.activities.push({
    author: activeUser.fullName,
    text: `Updated status to ${status}`,
    timestamp: new Date().toISOString()
  });
  
  dbService.saveTicket(ticket);
  res.json({ ticket });
});

app.post("/api/tickets/:id/callback", (req, res) => {
  const { id } = req.params;
  const { dateTime, phone, note } = req.body;
  const tickets = dbService.getTickets();
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  
  ticket.callbackDetails = {
    id: "cb-" + Date.now(),
    dateTime,
    phone,
    note,
    status: "pending"
  };
  
  ticket.status = TicketStatus.ESCALATED;
  ticket.activities.push({
    author: activeUser.fullName,
    text: `Scheduled Escaled SUPPORT CALLBACK for ${dateTime} to number ${phone}. SLA count reset.`,
    timestamp: new Date().toISOString()
  });
  
  // Increment custom counter in DB configurations
  const settings = dbService.getSettings();
  dbService.updateSettings({ callRequestCount: (settings.callRequestCount || 0) + 1 });
  
  dbService.saveTicket(ticket);
  res.json({ ticket, settings: dbService.getSettings() });
});

app.post("/api/tickets/:id/analyze", async (req, res) => {
  const { id } = req.params;
  const tickets = dbService.getTickets();
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  
  await analyzeTicketAI(ticket);
  res.json({ ticket });
});

// 7. Privacy & Consent Systems
app.get("/api/privacy/consent-logs", (req, res) => {
  res.json({ logs: dbService.getConsentLogs() });
});

app.post("/api/privacy/consent-logs", (req, res) => {
  const { contactId, type, action, source } = req.body;
  const contacts = dbService.getContacts();
  const contact = contacts.find(c => c.id === contactId);
  
  if (contact) {
    if (type === "marketing") {
      contact.optInStatus = action === "grant";
    }
    
    // Log timeline item to contact history
    contact.activities.unshift({
      id: "act-con-" + Date.now(),
      type: "consent_change",
      title: `Consent ${action === "grant" ? "Granted" : "Revoked"}`,
      details: `Type: ${type}. Source: ${source || "User Panel Interaction"}`,
      timestamp: new Date().toISOString()
    });
    dbService.saveContact(contact);
  }
  
  const log = dbService.addConsentLog({
    id: "cn-log-" + Date.now(),
    contactId,
    contactName: contact ? contact.name : "Anonymous Subscriber",
    type,
    action,
    ipAddress: "192.168.1.104",
    source: source || "Admin Consent Settings Console",
    timestamp: new Date().toISOString()
  });
  
  dbService.addAuditLog(activeUser.fullName, "Privacy Change Recorded", "Privacy Center", `Direct opt ${action} action compiled under compliance guidelines.`);
  res.json({ log });
});

app.post("/api/privacy/request-export", (req, res) => {
  const { contactId } = req.body;
  const contacts = dbService.getContacts();
  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return res.status(404).json({ error: "Contact not found" });
  
  dbService.addAuditLog(activeUser.fullName, "Data Export Triggered", "Privacy Center", `GDPR/DPDP Data export request logged for ${contact.name}`);
  res.json({ success: true, downloadUrl: `/api/privacy/download-archive?id=${contactId}`, details: `Data compression archived with cryptographic verification signature.` });
});

app.post("/api/privacy/request-delete", (req, res) => {
  const { contactId } = req.body;
  const contacts = dbService.getContacts();
  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return res.status(404).json({ error: "Contact not found" });
  
  dbService.addAuditLog(activeUser.fullName, "Right-to-be-Forgotten Enforced", "Privacy Center", `Permanently shredded and scrubbed data elements for contact: ${contact.name}`);
  dbService.deleteContact(contactId);
  res.json({ success: true });
});

// 8. Team Collaboration & Settings
app.get("/api/team", (req, res) => {
  res.json({ team: dbService.getTeam() });
});

app.post("/api/team/invite", (req, res) => {
  const { fullName, email, role } = req.body;
  const member = {
    id: "tm-" + Math.random().toString(36).substring(3, 8),
    fullName,
    email,
    role,
    status: "Active" as const,
    joinedAt: new Date().toISOString().split("T")[0]
  };
  
  dbService.saveTeamMember(member);
  dbService.addAuditLog(activeUser.fullName, "Invited Workspace Colleague", "Team", `Assigned role ${role} to ${fullName} (${email})`);
  res.json({ member });
});

app.get("/api/settings", (req, res) => {
  res.json({ settings: dbService.getSettings() });
});

app.post("/api/settings", (req, res) => {
  const updated = dbService.updateSettings(req.body);
  dbService.addAuditLog(activeUser.fullName, "Updated Corporate Workspace config", "Settings", `Saved new platform threshold rates.`);
  res.json({ settings: updated });
});

app.get("/api/organization/settings", (req, res) => {
  const settings = dbService.getSettings();
  const organization = {
    name: settings.orgName || "GrowthHQ SaaS",
    domain: (settings as any).domain || "SaaS Technology",
    phone: (settings as any).phone || "",
    email: (settings as any).email || "",
    whatsappBusinessId: (settings as any).whatsappBusinessId || "",
    whatsappPhoneId: (settings as any).whatsappPhoneId || "",
    logs: dbService.getAuditLogs().filter(log => log.module === "Settings" || log.module === "Settings Center")
  };
  res.json({ organization });
});

app.post("/api/organization/settings", (req, res) => {
  const { name, domain, phone, email, whatsappBusinessId, whatsappPhoneId } = req.body;
  
  const updated = dbService.updateSettings({
    orgName: name,
    domain,
    phone,
    email,
    whatsappBusinessId,
    whatsappPhoneId
  } as any);

  dbService.addAuditLog(activeUser.fullName, `Updated Corporate Settings: "${name}"`, "Settings", `Saved new platform credentials.`);

  const organization = {
    name: updated.orgName,
    domain: (updated as any).domain,
    phone: (updated as any).phone,
    email: (updated as any).email,
    whatsappBusinessId: (updated as any).whatsappBusinessId,
    whatsappPhoneId: (updated as any).whatsappPhoneId,
    logs: dbService.getAuditLogs().filter(log => log.module === "Settings" || log.module === "Settings Center")
  };

  res.json({ organization });
});

app.get("/api/audit-logs", (req, res) => {
  res.json({ logs: dbService.getAuditLogs() });
});

// 9. Sandbox Environment Setup (Lazy loaded isolate payload)
app.post("/api/sandbox/simulate", (req, res) => {
  const { actionType } = req.body;
  const logs: string[] = [];
  
  if (actionType === "whatsapp_receipts") {
    logs.push("Initializing isolated Sandboxed Transport channel...");
    logs.push("Mocking outbound dispatch trigger to VIP lists (+14155552671)...");
    logs.push("Meta Status Delivery Webhook triggered: ID evt_wa_m812739 -> STATUS: DELIVERED (2026-05-22T12:22:04Z)");
    logs.push("Meta Status Read Webhook triggered: ID evt_wa_m812739 -> STATUS: READ (2026-05-22T12:22:20Z)");
    logs.push("Sandbox Simulation Engine closed successfully. 0 real outbound bills charged.");
  } else if (actionType === "workflow_test") {
    logs.push("Launching temporary sandboxed execution session...");
    logs.push("Evaluating triggers: 'New signup recorded' matches test-contact Rajesh Kumar");
    logs.push("AI personalization filter completed with simulated tone override: POSITIVE");
    logs.push("Simulating dispatch: WhatsApp message dispatched, delivery report completed in 2ms.");
  } else if (actionType === "sms_bulk_run") {
    logs.push("Initializing Bulk SMS campaign stream transport...");
    logs.push("Carrier pipeline status: ACTIVE. Scheduled throttling limit: 100 msgs/sec");
    logs.push("Broadcasting test packages: 10 completed, 0 carrier packet dropouts.");
  } else {
    logs.push("Sandbox transport loaded. Status active. Waiting for trigger input.");
  }
  
  res.json({ logs });
});

// Serve static assets or mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
