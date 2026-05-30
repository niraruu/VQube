/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User and Auth Types
export enum UserRole {
  ORG_OWNER = "ORG_OWNER",
  ORG_ADMIN = "ORG_ADMIN",
  SUPPORT_AGENT = "SUPPORT_AGENT",
  MARKETING_MANAGER = "MARKETING_MANAGER",
  VIEWER = "VIEWER"
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  orgId: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: string;
  createdAt: string;
}

// CRM & Contact Intelligence Types
export interface ContactNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ContactActivity {
  id: string;
  type: "campaign" | "interaction" | "note" | "escalation" | "consent_change";
  title: string;
  details: string;
  timestamp: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  segment: "Leads" | "Premium Users" | "Inactive Users" | "Re-engagement" | "Trial Users";
  createdAt: string;
  optInStatus: boolean;
  spamRiskScore: number; // 0 to 100
  notes: ContactNote[];
  activities: ContactActivity[];
  aiSentimentOverride?: "positive" | "negative" | "neutral";
}

// Campaign Types
export enum CampaignChannel {
  WHATSAPP = "WhatsApp",
  SMS = "Bulk SMS",
  VOICE = "Voice escalation"
}

export enum CampaignStatus {
  DRAFT = "Draft",
  SCHEDULED = "Scheduled",
  ACTIVE = "Active",
  PAUSED = "Paused",
  COMPLETED = "Completed",
  FAILED = "Failed"
}

export interface CampaignTemplate {
  id: string;
  name: string;
  channel: CampaignChannel;
  content: string;
  approved: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  targetSegment: string;
  templateId: string;
  scheduledTime?: string;
  metrics: {
    sent: number;
    delivered: number;
    read: number;
    replied: number;
    failed: number;
  };
  createdAt: string;
}

// AI Chatbot Center Types
export interface AIPersona {
  id: string;
  name: string;
  systemInstruction: string;
  temperature: number;
  isActive: boolean;
  description: string;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "bot" | "system";
  text: string;
  timestamp: string;
  isSimulated?: boolean;
}

export interface AIChatLog {
  id: string;
  timestamp: string;
  prompt: string;
  response: string;
  tokensUsed: number;
  success: boolean;
  isFallback: boolean;
}

// Workflow Automation Types
export interface WorkflowStep {
  id: string;
  type: "trigger" | "condition" | "ai_action" | "campaign" | "notification" | "delay";
  label: string;
  config: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  description: string;
  isActive: boolean;
  steps: WorkflowStep[];
  runsCount: number;
  lastRun?: string;
}

export interface WorkflowActivityLog {
  id: string;
  workflowId: string;
  workflowName: string;
  status: "success" | "failed";
  timestamp: string;
  executedStepsCount: number;
  details: string;
}

// Support & Ticket System Types
export enum TicketPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  URGENT = "Urgent"
}

export enum TicketStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  ESCALATED = "Escalated",
  WAITING_USER = "Waiting for User",
  RESOLVED = "Resolved",
  CLOSED = "Closed"
}

export interface SupportCallback {
  id: string;
  dateTime: string;
  phone: string;
  note: string;
  status: "pending" | "completed" | "canceled";
}

export interface Ticket {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgent?: string;
  slaLimitMinutes: number;
  createdAt: string;
  updatedAt: string;
  aiSentiment: "positive" | "negative" | "neutral";
  aiSummary: string;
  activities: {
    author: string;
    text: string;
    timestamp: string;
  }[];
  callbackDetails?: SupportCallback;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

// Consent & Privacy Types
export interface ConsentLog {
  id: string;
  contactId: string;
  contactName: string;
  type: "marketing" | "analytics" | "ai_personalization" | "third_party_sharing";
  action: "grant" | "revoke";
  ipAddress: string;
  source: string; // e.g. "SMS opt-in", "Web profile"
  timestamp: string;
}

export interface PrivacyConsentSettings {
  marketingConsentRequired: boolean;
  analyticsConsentRequired: boolean;
  aiConsentRequired: boolean;
  dpdpComplianceEnabled: boolean;
  gdprComplianceEnabled: boolean;
}

// Team Member & Audits Types
export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: "Active" | "Pending";
  joinedAt?: string;
}

export interface OrgActivityLog {
  id: string;
  actor: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface SandboxSessionState {
  isSandboxActive: boolean;
  simulatedLogs: string[];
}
