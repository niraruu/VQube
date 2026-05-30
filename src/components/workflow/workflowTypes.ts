/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AIToneType = "Warm & Empathetic" | "Professional & Direct" | "Friendly & Conversational" | "Energetic & Salesy" | "Polite & Helpful";

export interface BusinessProduct {
  id: string;
  name: string;
  description: string;
  category: "Subscription" | "Catering" | "E-commerce" | "Consulting" | "General";
  defaultAiTone: AIToneType;
  escalationMinutesLimit: number;
  unresolvedAction: "sms_alert" | "voice_call" | "ticket_open" | "assign_agent";
}

export type StepType = "trigger" | "ai_action" | "campaign" | "condition" | "escalation";

export interface FriendlyStep {
  id: string;
  type: StepType;
  label: string; // Starts When, AI Decision, Action, Rules, Request Human Support
  description: string;
  config: {
    delayDuration?: number; // Minutes or hours
    aiToneOverride?: string;
    messageText?: string;
    channel?: "WhatsApp" | "Bulk SMS" | "Phone Call";
    ruleExpression?: string; // Rules details
    notificationUser?: string;
    escalationMethod?: string;
  };
}

export interface AutomatedActionTemplate {
  id: string;
  name: string;
  category: string; // Customer Support, Sales, Lead Generation, Onboarding, Re-engagement, Billing & Payments, Voice Escalation, WhatsApp Campaigns, Bulk SMS Campaigns, Customer Retention
  description: string;
  estimatedImpact: string;
  recommendedUseCase: string;
  steps: FriendlyStep[];
  aiSuggestions: string[];
}

export interface CustomizedAction {
  id: string;
  productId: string; // Tailored to specific Product/Service
  templateId?: string; // Original template link (optional)
  name: string;
  category: string;
  description: string;
  startsWhen: string; // Human-friendly replacement for Trigger
  aiToneSelection: AIToneType;
  customMessageTemplate: string;
  followUpDelayMinutes: number;
  audienceSegment: string;
  callSettings: {
    enableCallback: boolean;
    directLine: string;
    escalationTriggerText: string;
  };
  steps: FriendlyStep[];
  isActive: boolean;
  metrics: {
    runsCompleted: number;
    engagementRate: number; // Percentage
    aiResolutionRate: number; // Percentage
    humanSupportRequests: number; // Count
    completionRate: number; // Percentage
  };
}

export interface SimulationStepLog {
  id: string;
  stepIdx: number;
  label: string;
  status: "idle" | "running" | "success" | "escalated" | "completed";
  outputMessage?: string;
  timestamp: string;
}

export interface SimulationResult {
  actionId: string;
  customerName: string;
  customerPhone: string;
  customerSentiment: "positive" | "negative" | "neutral";
  timeline: SimulationStepLog[];
  completed: boolean;
  escalatedToHuman: boolean;
  messagePreview: string;
}
