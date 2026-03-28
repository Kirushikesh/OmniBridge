export enum BridgeCategory {
  EMERGENCY = "EMERGENCY",
  HEALTHCARE = "HEALTHCARE",
  ENVIRONMENT = "ENVIRONMENT",
  SOCIAL_AID = "SOCIAL_AID",
  GENERAL = "GENERAL"
}

export interface BridgeAction {
  title: string;
  description: string;
  type: "call" | "map" | "form" | "info";
  payload: string;
  locationStr?: string;
  coordinates?: { lat: number; lng: number };
}

export interface BridgeResult {
  category: BridgeCategory;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string;
  detectedLanguage: string;
  structuredData: Record<string, any>;
  actions: BridgeAction[];
  reasoning: string;
}

