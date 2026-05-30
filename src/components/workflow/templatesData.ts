/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AutomatedActionTemplate, BusinessProduct } from "./workflowTypes";

export const PRESET_PRODUCTS: BusinessProduct[] = [
  {
    id: "p-meal-sub",
    name: "Meal Subscription",
    description: "Daily or weekly organic food box delivered straight to subscribers' doorsteps.",
    category: "Subscription",
    defaultAiTone: "Warm & Empathetic",
    escalationMinutesLimit: 15,
    unresolvedAction: "sms_alert"
  },
  {
    id: "p-corp-catering",
    name: "Corporate Catering",
    description: "Premium buffet lunches, platters, and coffee services for office conferences.",
    category: "Catering",
    defaultAiTone: "Professional & Direct",
    escalationMinutesLimit: 30,
    unresolvedAction: "assign_agent"
  },
  {
    id: "p-event-orders",
    name: "Event Orders",
    description: "Large-scale bespoke wedding catering, party dinners, and live action counters.",
    category: "Catering",
    defaultAiTone: "Friendly & Conversational",
    escalationMinutesLimit: 20,
    unresolvedAction: "voice_call"
  }
];

export const TEMPLATE_CATEGORIES = [
  "Customer Support",
  "Sales",
  "Lead Generation",
  "Onboarding",
  "Re-engagement",
  "Billing & Payments",
  "Voice Escalation",
  "WhatsApp Campaigns",
  "Bulk SMS Campaigns",
  "Customer Retention"
];

export const PRESET_TEMPLATES: AutomatedActionTemplate[] = [
  {
    id: "tpl-1",
    name: "New Customer Welcome Flow",
    category: "Onboarding",
    description: "Welcome new customers automatically and guide them through onboarding using AI-powered messaging.",
    estimatedImpact: "+28% Retention Rate & engagement in month one.",
    recommendedUseCase: "Deliver onboarding guides, set active schedule, and explain services directly after sign-up.",
    aiSuggestions: [
      "Keep welcome copy warm. Suggest scheduling setup calls on WhatsApp within 3 hours.",
      "Add custom variables like '{{first_name}}' to boost link response clicks by 25%."
    ],
    steps: [
      {
        id: "step-t1-1",
        type: "trigger",
        label: "Starts When",
        description: "New subscription or customer signup is recorded.",
        config: { messageText: "Event: New Signup recorded" }
      },
      {
        id: "step-t1-2",
        type: "ai_action",
        label: "AI Recommendation",
        description: "Analyze customer category and auto-personalize welcome text.",
        config: { aiToneOverride: "Friendly & Conversational" }
      },
      {
        id: "step-t1-3",
        type: "campaign",
        label: "WhatsApp Dispatch",
        description: "Send Day 1 welcome guide with custom links.",
        config: { channel: "WhatsApp", messageText: "Welcome to our family, {{customer_name}}! 🚀 Let's optimize your schedule today." }
      },
      {
        id: "step-t1-4",
        type: "condition",
        label: "Rules",
        description: "If links are unopened within 24 hours.",
        config: { ruleExpression: "Has opened welcome link IS FALSE" }
      },
      {
        id: "step-t1-5",
        type: "escalation",
        label: "Request Human Support",
        description: "Trigger live agent to perform supportive follow-up.",
        config: { escalationMethod: "Add to High Priority Agent Queue" }
      }
    ]
  },
  {
    id: "tpl-2",
    name: "Abandoned Inquiry Follow-up",
    category: "Sales",
    description: "Re-engage leads who asked about pricing but did not finalize customized bookings or checkouts.",
    estimatedImpact: "Recover 22% of abandoned order conversations and convert to trial.",
    recommendedUseCase: "Preempt cold pricing leads by offering easy answers or a customized discount.",
    aiSuggestions: [
      "Set delay to exactly 4 hours to avoid appearing intrusive while remaining top of mind.",
      "Automate a 10% coupon only for products over $50."
    ],
    steps: [
      {
        id: "step-t2-1",
        type: "trigger",
        label: "Starts When",
        description: "Pricing inquiry idle with no checkout for 4 hours.",
        config: {}
      },
      {
        id: "step-t2-2",
        type: "ai_action",
        label: "AI Recommendation",
        description: "Draft personalized promotion to resolve booking doubt.",
        config: { aiToneOverride: "Energetic & Salesy" }
      },
      {
        id: "step-t2-3",
        type: "campaign",
        label: "Bulk SMS Broadcast",
        description: "Send friendly discount coupon with direct checkout URL.",
        config: { channel: "Bulk SMS", messageText: "Still interested in {{product_name}}? Here is 10% off for the next 24h: {{checkout_url}}" }
      },
      {
        id: "step-t2-4",
        type: "condition",
        label: "Rules",
        description: "Verify if lead responds with pricing question.",
        config: { ruleExpression: "Sentiment is INTERESTED" }
      },
      {
        id: "step-t2-5",
        type: "escalation",
        label: "Request Human Support",
        description: "Call hot lead directly to close deals.",
        config: { escalationMethod: "Notify Sales Coordinator" }
      }
    ]
  },
  {
    id: "tpl-3",
    name: "WhatsApp Lead Qualification",
    category: "Lead Generation",
    description: "Qualify inbound WhatsApp interests with context-rich AI surveys automatically.",
    estimatedImpact: "Reduce sales call workload by 65% by prioritizing top-tier buyers.",
    recommendedUseCase: "Instantly screen operational budgets and volume sizes before agent handoff.",
    aiSuggestions: [
      "Use structured choices (1, 2, or 3) to guide mobile users easily.",
      "Auto-tag qualified responses with 'Warm Segment' in the CRM tracker."
    ],
    steps: [
      {
        id: "step-t3-1",
        type: "trigger",
        label: "Starts When",
        description: "Inbound interest text received on corporate WhatsApp account.",
        config: {}
      },
      {
        id: "step-t3-2",
        type: "ai_action",
        label: "AI Recommendation",
        description: "Qualify interest, verify delivery pin-codes, and gauge size.",
        config: { aiToneOverride: "Polite & Helpful" }
      },
      {
        id: "step-t3-3",
        type: "campaign",
        label: "WhatsApp Dispatch",
        description: "Send dynamic interactive questionnaire.",
        config: { channel: "WhatsApp", messageText: "Hi {{customer_name}}! To help customize your catering, how many guests are you expecting? A) Under 20 B) 20-100 C) 100+." }
      },
      {
        id: "step-t3-4",
        type: "condition",
        label: "Rules",
        description: "If response indicates high-value query (C: 100+).",
        config: { ruleExpression: "Selected guest segment is C" }
      },
      {
        id: "step-t3-5",
        type: "escalation",
        label: "Request Human Support",
        description: "Schedule instantaneous VIP sales coordinator call.",
        config: { escalationMethod: "Assign VIP Account Manager" }
      }
    ]
  },
  {
    id: "tpl-4",
    name: "Support Ticket Escalation",
    category: "Customer Support",
    description: "Intelligently scan pending tickets and request human support instantly for high-risk accounts.",
    estimatedImpact: "Cut critical SLA breach incidents by 50% & rescue frustrated users.",
    recommendedUseCase: "Elevate negative feedback instantly to active managers before it slips.",
    aiSuggestions: [
      "Turn on urgent voice escalation alarms if client is marked 'Enterprise'.",
      "Let AI draft a pre-emptive 'Apology and Resolution' email draft for the agent."
    ],
    steps: [
      {
        id: "step-t4-1",
        type: "trigger",
        label: "Starts When",
        description: "Customer opens ticket analyzed with Frustrated sentiment.",
        config: {}
      },
      {
        id: "step-t4-2",
        type: "ai_action",
        label: "AI Recommendation",
        description: "Summarize issue details and flag priority level.",
        config: { aiToneOverride: "Warm & Empathetic" }
      },
      {
        id: "step-t4-3",
        type: "campaign",
        label: "WhatsApp Dispatch",
        description: "Send immediate empathy acknowledgement text.",
        config: { channel: "WhatsApp", messageText: "We apologize for the issue, {{customer_name}}. 😟 We are analyzing the bug and have escalated your ticket to our senior directors." }
      },
      {
        id: "step-t4-4",
        type: "condition",
        label: "Rules",
        description: "If ticket status is unresolved for over 15 minutes.",
        config: { ruleExpression: "Minutes outstanding > 15" }
      },
      {
        id: "step-t4-5",
        type: "escalation",
        label: "Request Human Support",
        description: "Alert emergency coordinator on active priority channel.",
        config: { escalationMethod: "Flag Urgently to Support Leads" }
      }
    ]
  },
  {
    id: "tpl-5",
    name: "Voice Callback Request",
    category: "Voice Escalation",
    description: "Offer automatic voice callback schedulers if customers demonstrate deep frustration in chat.",
    estimatedImpact: "Turn 40% of frustrated inquiries into high-loyalty calls.",
    recommendedUseCase: "Offer a high-touch callback scheduler link inside conversational threads when chats fail.",
    aiSuggestions: [
      "Offer voice sessions during business hours and dynamic SMS updates on success.",
      "Ask customer to state concern prior to call to prepare agents."
    ],
    steps: [
      {
        id: "step-t5-1",
        type: "trigger",
        label: "Starts When",
        description: "Customer texts double angry sentiment in general support chat.",
        config: {}
      },
      {
        id: "step-t5-2",
        type: "ai_action",
        label: "AI Recommendation",
        description: "Suggest moving conversation to direct voice call support.",
        config: { aiToneOverride: "Warm & Empathetic" }
      },
      {
        id: "step-t5-3",
        type: "campaign",
        label: "WhatsApp Dispatch",
        description: "Send direct SMS with unique callback scheduling link.",
        config: { channel: "WhatsApp", messageText: "We want to hear from you directly! Click here to select a preferred callback slot: {{schedule_link}}" }
      },
      {
        id: "step-t5-4",
        type: "condition",
        label: "Rules",
        description: "Verify if slot gets scheduled within 2 hours.",
        config: { ruleExpression: "Has selected callback slot IS TRUE" }
      },
      {
        id: "step-t5-5",
        type: "escalation",
        label: "Request Human Support",
        description: "Initiate direct voice line bridge to support advisor.",
        config: { escalationMethod: "Schedule Outbound Call" }
      }
    ]
  },
  {
    id: "tpl-6",
    name: "Inactive Customer Re-engagement",
    category: "Re-engagement",
    description: "Reconnect with silent subscribers of past months with personalized check-ins.",
    estimatedImpact: "+14% Reactivation rates on historical leads.",
    recommendedUseCase: "Automate light touch check-ins offering customized value without being annoying.",
    aiSuggestions: [
      "Draft messages about new updates or seasonal meal additions.",
      "Limit checking frequency to maximum once per 90 days."
    ],
    steps: [
      {
        id: "step-t6-1",
        type: "trigger",
        label: "Starts When",
        description: "Zero activity or subscription queries logged for 30 days.",
        config: {}
      },
      {
        id: "step-t6-2",
        type: "ai_action",
        label: "AI Recommendation",
        description: "Generate interesting update hook tailored to customer preferences.",
        config: { aiToneOverride: "Friendly & Conversational" }
      },
      {
        id: "step-t6-3",
        type: "campaign",
        label: "WhatsApp Dispatch",
        description: "Send friendly update summary to stimulate chat.",
        config: { channel: "WhatsApp", messageText: "Hey {{customer_name}}! We just launched three delicious new organic options designed specifically for healthy subscriptions. Care to check them out?" }
      },
      {
        id: "step-t6-4",
        type: "condition",
        label: "Rules",
        description: "If inactive customer responds saying 'TELL ME MORE'.",
        config: { ruleExpression: "Last text includes 'MORE'" }
      },
      {
        id: "step-t6-5",
        type: "escalation",
        label: "Request Human Support",
        description: "Notify growth executive to handle conversation.",
        config: { escalationMethod: "Forward Thread to Growth Lead" }
      }
    ]
  },
  {
    id: "tpl-7",
    name: "Subscription Renewal Reminder",
    category: "Customer Retention",
    description: "Remind clients about auto-renew events with clear billing digests before payments trigger.",
    estimatedImpact: "+94% Retention rate; reduces payment disputes and cancellations.",
    recommendedUseCase: "Send transparent billing updates 3 days prior with rich links on WhatsApp.",
    aiSuggestions: [
      "Acknowledge the billing frequency terms up front. Include simple links to modify orders.",
      "Promote key organic ingredients or menu schedules for upcoming weeks to validate price value."
    ],
    steps: [
      {
        id: "step-t7-1",
        type: "trigger",
        label: "Starts When",
        description: "3 Days remaining before subscription renews.",
        config: {}
      },
      {
        id: "step-t7-2",
        type: "ai_action",
        label: "AI Recommendation",
        description: "Review past order favorite and highlights upcoming favorites.",
        config: { aiToneOverride: "Professional & Direct" }
      },
      {
        id: "step-t7-3",
        type: "campaign",
        label: "Bulk SMS Broadcast",
        description: "Send clean pricing digest and dynamic upcoming delivery calendar.",
        config: { channel: "Bulk SMS", messageText: "Your premium renewal is scheduled in 3 days. 🥗 Hand-crafted meals will resume on plan. Review upcoming menus here: {{menu_url}}" }
      },
      {
        id: "step-t7-4",
        type: "condition",
        label: "Rules",
        description: "Check if client requests manual modification of items.",
        config: { ruleExpression: "User replies 'CHANGE' or 'CANCEL'" }
      },
      {
        id: "step-t7-5",
        type: "escalation",
        label: "Request Human Support",
        description: "Relay details to client retention executive.",
        config: { escalationMethod: "Generate Modification Ticket" }
      }
    ]
  },
  {
    id: "tpl-8",
    name: "Payment Failure Recovery",
    category: "Billing & Payments",
    description: "Graceful billing retry workflows utilizing helpful AI assistance rather than rigid blockages.",
    estimatedImpact: "Gracefully recover 78% of failed credit cards with friendly dialogs.",
    recommendedUseCase: "Avoid aggressive warnings; direct customers to interactive credit cards updater helper.",
    aiSuggestions: [
      "Explain that organic meal orders are locked in, but need updated details to complete dispatch.",
      "Allow 48 hours buffer period before system restrictions."
    ],
    steps: [
      {
        id: "step-t8-1",
        type: "trigger",
        label: "Starts When",
        description: "Gateway declines renewal transaction.",
        config: {}
      },
      {
        id: "step-t8-2",
        type: "ai_action",
        label: "AI Recommendation",
        description: "Craft polite payment portal invitation resolving decline reason code.",
        config: { aiToneOverride: "Warm & Empathetic" }
      },
      {
        id: "step-t8-3",
        type: "campaign",
        label: "WhatsApp Dispatch",
        description: "Send direct payment assistant helper links.",
        config: { channel: "WhatsApp", messageText: "Hi {{customer_name}}, we attempted your subscription transaction but the card failed. Click here to confirm secure update card: {{gateway_url}}" }
      },
      {
        id: "step-t8-4",
        type: "condition",
        label: "Rules",
        description: "If card status is outstanding after 48 hours.",
        config: { ruleExpression: "Attempts count > 2" }
      },
      {
        id: "step-t8-5",
        type: "escalation",
        label: "Request Human Support",
        description: "Create human accounts task to contact customer supportively.",
        config: { escalationMethod: "Assign Billing Coordinator Review" }
      }
    ]
  },
  {
    id: "tpl-9",
    name: "AI FAQ Auto-Responder",
    category: "Customer Support",
    description: "Empower your workspace to answer classic operational questions using smart vector answers.",
    estimatedImpact: "Instantly answer 60% of recurring questions, leaving agents free.",
    recommendedUseCase: "Resolve quick inquiries (timings, shipping zones, allergen lists) within seconds.",
    aiSuggestions: [
      "Keep answer brief. Add helpful links to detailed service FAQs.",
      "Ask 'Was this response helpful?' to build continuous feedback ratings."
    ],
    steps: [
      {
        id: "step-t9-1",
        type: "trigger",
        label: "Starts When",
        description: "Inbound question matches FAQ keyword clusters.",
        config: {}
      },
      {
        id: "step-t9-2",
        type: "ai_action",
        label: "AI Recommendation",
        description: "Synthesize exact matches from organic FAQ database.",
        config: { aiToneOverride: "Polite & Helpful" }
      },
      {
        id: "step-t9-3",
        type: "campaign",
        label: "WhatsApp Dispatch",
        description: "Send fluent operational answer.",
        config: { channel: "WhatsApp", messageText: "Hi! Based on your query: Our organic meal delivery operates Monday-Friday from 6 AM to 9 AM. Here are allergen stats: {{faq_url}}." }
      },
      {
        id: "step-t9-4",
        type: "condition",
        label: "Rules",
        description: "If user marks response as unhelpful or texts 'TALK TO HUMAN'.",
        config: { ruleExpression: "Response includes 'HUMAN' OR feedback score < 3" }
      },
      {
        id: "step-t9-5",
        type: "escalation",
        label: "Request Human Support",
        description: "Alert active live support desk dashboard.",
        config: { escalationMethod: "Escalate to Interactive Support Team" }
      }
    ]
  },
  {
    id: "tpl-10",
    name: "Customer Satisfaction Follow-up",
    category: "Customer Retention",
    description: "Request dynamic ratings from recent customers and trigger immediate relief checkins for low scores.",
    estimatedImpact: "3x More active reviews collected; preempt negative social listings.",
    recommendedUseCase: "Assess customer satisfaction (CSAT) exactly 2 hours after daily box handoff.",
    aiSuggestions: [
      "Frame the review prompt positively. Praise their support in our mission.",
      "If score is 5, prompt for direct Google Maps or organic review listing link."
    ],
    steps: [
      {
        id: "step-t10-1",
        type: "trigger",
        label: "Starts When",
        description: "Meal box delivered or transaction completed successfully.",
        config: {}
      },
      {
        id: "step-t10-2",
        type: "ai_action",
        label: "AI Recommendation",
        description: "Inquire about user satisfaction score politely.",
        config: { aiToneOverride: "Warm & Empathetic" }
      },
      {
        id: "step-t10-3",
        type: "campaign",
        label: "WhatsApp Dispatch",
        description: "Send direct feedback inquiry prompt.",
        config: { channel: "WhatsApp", messageText: "Hi {{customer_name}}! 🌟 Rate today's organic meal bowl from 1 to 5. We design menus based on your feedback!" }
      },
      {
        id: "step-t10-4",
        type: "condition",
        label: "Rules",
        description: "If rating is 1 or 2 (poor result).",
        config: { ruleExpression: "Rating score <= 2" }
      },
      {
        id: "step-t10-5",
        type: "escalation",
        label: "Request Human Support",
        description: "Alert operations manager immediately for damage control.",
        config: { escalationMethod: "Notify Customer Success Escalation Unit" }
      }
    ]
  }
];
