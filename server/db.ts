/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { 
  Contact, Campaign, CampaignTemplate, AIPersona, AIChatMessage, AIChatLog,
  Workflow, WorkflowActivityLog, Ticket, FAQItem, ConsentLog, TeamMember,
  OrgActivityLog, UserRole, User, CampaignChannel, CampaignStatus, TicketPriority, TicketStatus
} from "../src/types";

const STORAGE_PATH = path.join(process.cwd(), "db-storage.json");

interface DBStructure {
  users: User[];
  contacts: Contact[];
  campaigns: Campaign[];
  templates: CampaignTemplate[];
  personas: AIPersona[];
  chatMessages: AIChatMessage[];
  chatLogs: AIChatLog[];
  workflows: Workflow[];
  workflowActivityLogs: WorkflowActivityLog[];
  tickets: Ticket[];
  faqs: FAQItem[];
  consentLogs: ConsentLog[];
  teamMembers: TeamMember[];
  activityLogs: OrgActivityLog[];
  settings: {
    orgName: string;
    avatarUrl: string;
    whatsappPhonePlaceholder: string;
    smsGatewayUrl: string;
    aiModelSelected: string;
    safetyLevel: string;
    supportSlaMinutes: number;
    optInTracking: boolean;
    unsubscribeKeyword: string;
    campaignThrottlingRate: number; // ms gs between msg
    callRequestCount: number;
  };
}

const DEFAULT_DB: DBStructure = {
  users: [
    { id: "u-1", email: "nirjarajain01@gmail.com", fullName: "Nirjara Jain", role: UserRole.ORG_OWNER, orgId: "org-123" },
    { id: "u-2", email: "admin@growthhq.co", fullName: "Sarah Connor", role: UserRole.ORG_ADMIN, orgId: "org-123" },
    { id: "u-3", email: "agent@growthhq.co", fullName: "Marcus Wright", role: UserRole.SUPPORT_AGENT, orgId: "org-123" },
    { id: "u-4", email: "marketing@growthhq.co", fullName: "John Connor", role: UserRole.MARKETING_MANAGER, orgId: "org-123" },
    { id: "u-5", email: "viewer@growthhq.co", fullName: "Kyle Reese", role: UserRole.VIEWER, orgId: "org-123" }
  ],
  contacts: [
    {
      id: "c-1",
      name: "Rajesh Kumar",
      phone: "+919876543210",
      email: "rajesh.kumar@gmail.com",
      tags: ["active", "enterprise", "high-value"],
      segment: "Premium Users",
      createdAt: "2026-01-15T09:00:00Z",
      optInStatus: true,
      spamRiskScore: 12,
      notes: [
        { id: "n-1", author: "Sarah Connor", text: "Enterprise executive. Prefers WhatsApp communication.", createdAt: "2026-03-10T11:00:00Z" }
      ],
      activities: [
        { id: "a-1", type: "campaign", title: "Premium Welcome Campaign", details: "Sent via WhatsApp. Opened.", timestamp: "2026-05-10T14:00:00Z" },
        { id: "a-2", type: "interaction", title: "AI Assistant Query", details: "Asked about integration endpoints. Summary: Positive sentiment.", timestamp: "2026-05-20T10:15:00Z" }
      ]
    },
    {
      id: "c-2",
      name: "Esther Howard",
      phone: "+14155552671",
      email: "esther.howard@outlook.com",
      tags: ["lead", "trial"],
      segment: "Leads",
      createdAt: "2026-04-20T14:30:00Z",
      optInStatus: true,
      spamRiskScore: 5,
      notes: [],
      activities: [
        { id: "a-3", type: "interaction", title: "Opt-In Recorded", details: "Subscribed via Web Sign-Up widget", timestamp: "2026-04-20T14:30:00Z" }
      ]
    },
    {
      id: "c-3",
      name: "Amir Al-Othman",
      phone: "+971501234567",
      email: "amir.othman@dubaihq.ae",
      tags: ["inactive", "winback"],
      segment: "Inactive Users",
      createdAt: "2025-11-05T08:00:00Z",
      optInStatus: true,
      spamRiskScore: 35,
      notes: [
        { id: "n-2", author: "John Connor", text: "Stopped using widget after trial expired. Attempt SMS win-back.", createdAt: "2026-02-01T15:00:00Z" }
      ],
      activities: [
        { id: "a-4", type: "campaign", title: "SMS Re-engagement Promo", details: "Delivery failure: unreachable.", timestamp: "2026-03-01T12:00:00Z" }
      ]
    },
    {
      id: "c-4",
      name: "Aki Tanaka",
      phone: "+818012345678",
      email: "tanaka.aki@nifty.com",
      tags: ["active", "trial-ends"],
      segment: "Trial Users",
      createdAt: "2026-05-10T02:00:00Z",
      optInStatus: true,
      spamRiskScore: 2,
      notes: [],
      activities: [
        { id: "a-5", type: "interaction", title: "Onboarding Flow Triggered", details: "Received Day 1 WhatsApp guide", timestamp: "2026-05-10T02:05:00Z" }
      ]
    },
    {
      id: "c-5",
      name: "Dianne Russell",
      phone: "+16175550182",
      email: "dianne.r@gmail.com",
      tags: ["re-engage", "opt-out-risk"],
      segment: "Re-engagement",
      createdAt: "2026-02-14T11:45:00Z",
      optInStatus: true,
      spamRiskScore: 48,
      notes: [
        { id: "n-3", author: "Marcus Wright", text: "Has complained about frequent messaging. Reduced SMS frequency limit to 1 per week.", createdAt: "2026-04-12T09:30:00Z" }
      ],
      activities: [
        { id: "a-6", type: "consent_change", title: "Opt-Out Marketing SMS", details: "User requested unsubscribe via Bulk SMS keyword STOP", timestamp: "2026-05-19T16:22:00Z" }
      ]
    }
  ],
  campaigns: [
    {
      id: "camp-1",
      name: "VIP Premium Perks Broadcast",
      channel: CampaignChannel.WHATSAPP,
      status: CampaignStatus.COMPLETED,
      targetSegment: "Premium Users",
      templateId: "tpl-wa-welcome",
      createdAt: "2026-05-01T10:00:00Z",
      metrics: { sent: 120, delivered: 120, read: 114, replied: 48, failed: 0 }
    },
    {
      id: "camp-2",
      name: "Mid-Year Flash SMS Offer",
      channel: CampaignChannel.SMS,
      status: CampaignStatus.COMPLETED,
      targetSegment: "Leads",
      templateId: "tpl-sms-flash",
      createdAt: "2026-05-10T12:00:00Z",
      metrics: { sent: 850, delivered: 812, read: 410, replied: 22, failed: 38 }
    },
    {
      id: "camp-3",
      name: "Trial Users Day-5 Onboarding",
      channel: CampaignChannel.WHATSAPP,
      status: CampaignStatus.ACTIVE,
      targetSegment: "Trial Users",
      templateId: "tpl-wa-onboarding",
      createdAt: "2026-05-20T08:00:00Z",
      metrics: { sent: 45, delivered: 44, read: 38, replied: 12, failed: 1 }
    },
    {
      id: "camp-4",
      name: "Inactive User Winback Spark",
      channel: CampaignChannel.SMS,
      status: CampaignStatus.SCHEDULED,
      targetSegment: "Inactive Users",
      templateId: "tpl-sms-winback",
      createdAt: "2026-05-21T15:00:00Z",
      scheduledTime: "2026-05-25T14:00:00Z",
      metrics: { sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 }
    }
  ],
  templates: [
    {
      id: "tpl-wa-welcome",
      name: "VIP Welcome Special",
      channel: CampaignChannel.WHATSAPP,
      content: "Hello {{name}}! Welcome to OmniChannel Platform. 🚀 As a Premium Subscriber, we're giving you direct VIP support. Text 'ASSIST' to open a live chat with our expert bot. Reply STOP to opt out.",
      approved: true
    },
    {
      id: "tpl-sms-flash",
      name: "Lead Conversion Flash 15",
      channel: CampaignChannel.SMS,
      content: "OmniChannel VIP: Hey {{name}}! Get 15% off your growth plan today. Use coupon GROWTH15 at checkout. Valid for 48h. Opt-out reply UNSUB.",
      approved: true
    },
    {
      id: "tpl-wa-onboarding",
      name: "Onboarding Check",
      channel: CampaignChannel.WHATSAPP,
      content: "Hi {{name}}, how has your trial been? Did you manage to test our Sandbox Chat simulator? Let us know if you want a callback support agent to schedule a workspace brief.",
      approved: true
    },
    {
      id: "tpl-sms-winback",
      name: "Winback SMS offer",
      channel: CampaignChannel.SMS,
      content: "We miss you {{name}}! Connect back with OmniChannel Platform and claim 100 free SMS credits today: https://growthhq.co/win-back",
      approved: true
    }
  ],
  personas: [
    {
      id: "p-1",
      name: "Support Desk Hero",
      systemInstruction: "You are a professional corporate support coordinator for OmniChannel SaaS platform. Answer user technical questions calmly and list step-by-step guidance. Be concise and empathetic.",
      temperature: 0.6,
      isActive: true,
      description: "Handles customer support queries politely and triggers human escalation if requested."
    },
    {
      id: "p-2",
      name: " Friendly chat",
      systemInstruction: "You are a friendly, witty, and conversational chat helper who keeps communication breezy, lighthearted, and highly active. Encourage user conversion.",
      temperature: 0.9,
      isActive: false,
      description: "Ideal for automated conversational flows and friendly checkins."
    }
  ],
  chatMessages: [
    { id: "m-1", sender: "user", text: "Hello, I need help setting up my WhatsApp webhook.", timestamp: "2026-05-22T09:00:00Z" },
    { id: "m-2", sender: "bot", text: "Hi there! I would be happy to guide you with webhook structures. Please verify that you have registered a template in Settings > Sandbox setup. Let me know if you would like to test this hook.", timestamp: "2026-05-22T09:01:00Z" }
  ],
  chatLogs: [
    { id: "cl-1", timestamp: "2026-05-22T09:01:00Z", prompt: "Hello, I need help setting up my WhatsApp webhook.", response: "Hi there! I would be happy to guide you with webhook structures. Please verify that you have registered a template in Settings > Sandbox setup.", tokensUsed: 145, success: true, isFallback: true }
  ],
  workflows: [
    {
      id: "wf-1",
      name: "SaaS Signup Onboarding Journey",
      trigger: "New signup",
      description: "Triggered whenever a brand new lead is recorded on the CRM roster.",
      isActive: true,
      runsCount: 34,
      lastRun: "2026-05-22T10:15:00Z",
      steps: [
        { id: "ws-1", type: "trigger", label: "Event: New Signup recorded", config: { source: "web_api" } },
        { id: "ws-2", type: "ai_action", label: "Analyze Lead using Gemini AI", config: { prompt: "Analyze this telephone area code and name to create personalization tags" } },
        { id: "ws-3", type: "campaign", label: "Dispatch WhatsApp Welcome Template", config: { templateId: "tpl-wa-welcome" } },
        { id: "ws-4", type: "delay", label: "Hold execution for 2 Days", config: { durationDays: 2 } },
        { id: "ws-5", type: "condition", label: "Verify user response state", config: { conditionName: "Has Replied" } }
      ]
    },
    {
      id: "wf-2",
      name: "SLA Support Spillover Escalation",
      trigger: "Ticket escalated",
      description: "Ensures open issues receive high-priority SLA tracking and immediate notification alerts.",
      isActive: true,
      runsCount: 8,
      lastRun: "2026-05-21T18:22:00Z",
      steps: [
        { id: "ws-6", type: "trigger", label: "Event: SLA breached", config: { limitMinutes: 30 } },
        { id: "ws-7", type: "ai_action", label: "Generate support conversation summary", config: {} },
        { id: "ws-8", type: "notification", label: "Dispatch Voice Escalation Alert", config: { contactNo: "+16175550182" } }
      ]
    }
  ],
  workflowActivityLogs: [
    { id: "wl-1", workflowId: "wf-1", workflowName: "SaaS Signup Onboarding Journey", status: "success", timestamp: "2026-05-22T10:15:00Z", executedStepsCount: 3, details: "Executed Trigger -> AI Analytics Tagging -> WhatsApp Dispatch to Rajesh Kumar successfully. Remaining delay sequence active." }
  ],
  tickets: [
    {
      id: "t-1",
      contactId: "c-1",
      contactName: "Rajesh Kumar",
      contactPhone: "+919876543210",
      title: "WhatsApp Opt-in Webhook Failure",
      description: "Trying to fire opt-in update webhook but hitting HTTP 504 gateway timeout from production sandbox servers.",
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      assignedAgent: "Marcus Wright",
      slaLimitMinutes: 30,
      createdAt: "2026-05-22T11:00:00Z",
      updatedAt: "2026-05-22T11:45:00Z",
      aiSentiment: "negative",
      aiSummary: "The customer is frustrated regarding a 504 Gateway timeout hitting their opt-in webhooks. Immediate configuration resolution needed.",
      activities: [
        { author: "System AI", text: "Ticket created. Sentiment analyzed: NEGATIVE. Scheduled SLA countdown to 30 mins.", timestamp: "2026-05-22T11:00:00Z" }
      ]
    },
    {
      id: "t-2",
      contactId: "c-3",
      contactName: "Amir Al-Othman",
      contactPhone: "+971501234567",
      title: "Bulk SMS campaign delivery failure",
      description: "Created campaign Mid-Year Flash. Target contacts inside India and UAE reporting that messages are pending in Draft or failed completely.",
      priority: TicketPriority.URGENT,
      status: TicketStatus.ESCALATED,
      assignedAgent: "Sarah Connor",
      slaLimitMinutes: 15,
      createdAt: "2026-05-22T08:30:00Z",
      updatedAt: "2026-05-22T10:00:00Z",
      aiSentiment: "negative",
      aiSummary: "Critical outbound campaign delivery failure impacting UAE and India country-routing channels. Needs instant re-routing.",
      activities: [
        { author: "System AI", text: "SMS provider feedback analyzed. Carrier restriction rules flagged. Escalated to Network Operator.", timestamp: "2026-05-22T08:35:00Z" }
      ]
    }
  ],
  faqs: [
    { id: "fq-1", question: "How standard WhatsApp Opt-In works?", answer: "To text users on WhatsApp, you must track consent. We support web-form integrations and keyword opt-ins. Users may reply 'START' or 'YES' to opt in.", tags: ["whatsapp", "compliance", "opt-in"] },
    { id: "fq-2", question: "How frequent is Bulk SMS throttled?", answer: "To optimize carrier network delivery, we throttle campaign SMS triggers to standard levels (e.g., 50 SMS/second). Throttling keeps your sender ID spam rating clean.", tags: ["sms", "throttling", "delivery"] },
    { id: "fq-3", question: "What is India DPDP Compliance policy?", answer: "India's Digital Personal Data Protection Act requires unambiguous, revocable consent. Opt-out channels must be standard and direct in local SMS and WhatsApp templates.", tags: ["compliance", "privacy", "dpdp"] }
  ],
  consentLogs: [
    { id: "cn-log-1", contactId: "c-1", contactName: "Rajesh Kumar", type: "marketing", action: "grant", ipAddress: "123.45.67.89", source: "SMS opt-in START keyword", timestamp: "2026-05-18T09:12:00Z" },
    { id: "cn-log-2", contactId: "c-5", contactName: "Dianne Russell", type: "marketing", action: "revoke", ipAddress: "98.76.54.32", source: "WhatsApp Chat OPT-OUT", timestamp: "2026-05-19T16:22:00Z" }
  ],
  teamMembers: [
    { id: "tm-1", fullName: "Nirjara Jain", email: "nirjarajain01@gmail.com", role: UserRole.ORG_OWNER, status: "Active", joinedAt: "2026-01-01" },
    { id: "tm-2", fullName: "Sarah Connor", email: "sarah@growthhq.co", role: UserRole.ORG_ADMIN, status: "Active", joinedAt: "2026-02-05" },
    { id: "tm-3", fullName: "Marcus Wright", email: "marcus@growthhq.co", role: UserRole.SUPPORT_AGENT, status: "Active", joinedAt: "2026-03-20" },
    { id: "tm-4", fullName: "John Connor", email: "john@growthhq.co", role: UserRole.MARKETING_MANAGER, status: "Active", joinedAt: "2026-04-10" }
  ],
  activityLogs: [
    { id: "act-1", actor: "Sarah Connor", action: "Updated Campaign Template", module: "Campaigns", details: "Modified template Lead Conversion Flash 15 content.", timestamp: "2026-05-22T11:21:00Z" },
    { id: "act-2", actor: "Marcus Wright", action: "Assigned Support Ticket", module: "Support", details: "Assigned Ticket #t-1 to Marcus Wright.", timestamp: "2026-05-22T11:45:00Z" }
  ],
  settings: {
    orgName: "GrowthHQ SaaS",
    avatarUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=150&auto=format&fit=crop",
    whatsappPhonePlaceholder: "+1 (855) 512-OMNI",
    smsGatewayUrl: "https://api.omnichannel.sms/v1/gateway",
    aiModelSelected: "gemini-3.5-flash",
    safetyLevel: "Block Medium and High Harmful Content",
    supportSlaMinutes: 30,
    optInTracking: true,
    unsubscribeKeyword: "STOP",
    campaignThrottlingRate: 100,
    callRequestCount: 2
  }
};

export class Database {
  private data: DBStructure;

  constructor() {
    this.data = { ...DEFAULT_DB };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(STORAGE_PATH)) {
        const fileContent = fs.readFileSync(STORAGE_PATH, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (err) {
      console.error("Failed to read database, falling back to defaults", err);
      this.data = { ...DEFAULT_DB };
    }
  }

  private save() {
    try {
      fs.writeFileSync(STORAGE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write to database utility storage:", err);
    }
  }

  // Auth Operations
  getUsers() { return this.data.users; }
  addUser(user: User) { this.data.users.push(user); this.save(); return user; }

  // CRM Contacts
  getContacts() { return this.data.contacts; }
  saveContact(contact: Contact) {
    const idx = this.data.contacts.findIndex(c => c.id === contact.id);
    if (idx >= 0) {
      this.data.contacts[idx] = contact;
    } else {
      this.data.contacts.push(contact);
    }
    this.save();
    return contact;
  }
  deleteContact(id: string) {
    this.data.contacts = this.data.contacts.filter(c => c.id !== id);
    this.save();
  }

  // Campaigns
  getCampaigns() { return this.data.campaigns; }
  getTemplates() { return this.data.templates; }
  saveCampaign(campaign: Campaign) {
    const idx = this.data.campaigns.findIndex(c => c.id === campaign.id);
    if (idx >= 0) {
      this.data.campaigns[idx] = campaign;
    } else {
      this.data.campaigns.push(campaign);
    }
    this.save();
    return campaign;
  }
  saveTemplate(template: CampaignTemplate) {
    const idx = this.data.templates.findIndex(t => t.id === template.id);
    if (idx >= 0) {
      this.data.templates[idx] = template;
    } else {
      this.data.templates.push(template);
    }
    this.save();
    return template;
  }

  // AI Center
  getPersonas() { return this.data.personas; }
  savePersona(persona: AIPersona) {
    if (persona.isActive) {
      this.data.personas.forEach(p => p.isActive = false);
    }
    const idx = this.data.personas.findIndex(p => p.id === persona.id);
    if (idx >= 0) {
      this.data.personas[idx] = persona;
    } else {
      this.data.personas.push(persona);
    }
    this.save();
    return persona;
  }
  getChatMessages() { return this.data.chatMessages; }
  addChatMessage(msg: AIChatMessage) {
    this.data.chatMessages.push(msg);
    if (this.data.chatMessages.length > 30) {
      this.data.chatMessages.shift(); // keep active chat window concise
    }
    this.save();
    return msg;
  }
  clearChatMessages() {
    this.data.chatMessages = [];
    this.save();
  }
  getChatLogs() { return this.data.chatLogs; }
  addChatLog(log: AIChatLog) {
    this.data.chatLogs.unshift(log);
    if (this.data.chatLogs.length > 50) this.data.chatLogs.pop();
    this.save();
    return log;
  }

  // Automation Workflows
  getWorkflows() { return this.data.workflows; }
  saveWorkflow(workflow: Workflow) {
    const idx = this.data.workflows.findIndex(w => w.id === workflow.id);
    if (idx >= 0) {
      this.data.workflows[idx] = workflow;
    } else {
      this.data.workflows.push(workflow);
    }
    this.save();
    return workflow;
  }
  getWorkflowLogs() { return this.data.workflowActivityLogs; }
  addWorkflowLog(log: WorkflowActivityLog) {
    this.data.workflowActivityLogs.unshift(log);
    if (this.data.workflowActivityLogs.length > 40) this.data.workflowActivityLogs.pop();
    this.save();
    return log;
  }

  // Support
  getTickets() { return this.data.tickets; }
  saveTicket(ticket: Ticket) {
    const idx = this.data.tickets.findIndex(t => t.id === ticket.id);
    if (idx >= 0) {
      this.data.tickets[idx] = { ...ticket, updatedAt: new Date().toISOString() };
    } else {
      this.data.tickets.push(ticket);
    }
    this.save();
    return ticket;
  }
  getFAQs() { return this.data.faqs; }
  saveFAQ(faq: FAQItem) {
    const idx = this.data.faqs.findIndex(f => f.id === faq.id);
    if (idx >= 0) {
      this.data.faqs[idx] = faq;
    } else {
      this.data.faqs.push(faq);
    }
    this.save();
    return faq;
  }

  // Privacy & Consent
  getConsentLogs() { return this.data.consentLogs; }
  addConsentLog(item: ConsentLog) {
    this.data.consentLogs.unshift(item);
    this.save();
    return item;
  }

  // Team Collaboration
  getTeam() { return this.data.teamMembers; }
  saveTeamMember(member: TeamMember) {
    const idx = this.data.teamMembers.findIndex(m => m.id === member.id);
    if (idx >= 0) {
      this.data.teamMembers[idx] = member;
    } else {
      this.data.teamMembers.push(member);
    }
    this.save();
    return member;
  }

  // Settings
  getSettings() { return this.data.settings; }
  updateSettings(settings: Partial<DBStructure["settings"]>) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
    return this.data.settings;
  }

  // Activity audits
  getAuditLogs() { return this.data.activityLogs; }
  addAuditLog(actor: string, action: string, module: string, details: string) {
    const log: OrgActivityLog = {
      id: "act-" + Math.random().toString(36).substring(3, 8),
      actor,
      action,
      module,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 50) this.data.activityLogs.pop();
    this.save();
    return log;
  }
}

export const dbService = new Database();
