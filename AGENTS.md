# 🤖 OmniBridge — Agents and Intelligence Architecture

**OmniBridge** is architected to function as a multi-specialty agentic ecosystem. While the current implementation utilizes a singular, powerful Gemini-3-Flash model, the internal reasoning paths are specialized to handle complex, real-world societal benefit scenarios.

---

## 🗺 Repository Map & Folder Structure

For developers and AI agents onboarding to this project, here is the high-level layout:

```text
OmniBridge/
├── src/
│   ├── services/
│   │   └── gemini.ts        <-- Core Intelligence Logic (Intent Engine)
│   ├── __tests__/           <-- Unit and Integration Tests
│   ├── App.tsx              <-- Primary UI & Event orchestration
│   ├── main.tsx             <-- App Entry Point
│   └── index.css            <-- Design System & Global Styles
├── .agents/                 <-- Agent configurations and skills
├── Dockerfile               <-- Deployment containerization
├── cloudbuild.yaml          <-- Google Cloud Build CI/CD config
├── package.json             <-- Dependency and Scripts Manifest
└── README.md                <-- Project Overview & Setup
```

---

## 🏗 The Core Engine

The OmniBridge Intent Engine acts as a **Reasoning Coordinator**, parsing messy, multimodal inputs and delegating the logic to specific agent personas:

### 📥 1. Intake Agent (Multimodal Perception)
- **Role**: Parses and sanitizes raw input streams (text, images, soon audio).
- **Core Logic**: Located in `src/services/gemini.ts`.
- **Primary Tooling**: Uses Gemini-3-Flash's multimodal vision and text parsing capabilities, utilizing native **Google Search Grounding** to verify intelligence.
- **Constraint**: Strict 2,500 character payload capacity limit to prevent prompt injection and context overflow.
- **Goal**: Convert unstructured data into verified and structured entities with zero-shot **Multilingual Language Detection**.


### ⚖️ 2. The Categorizer (Intent Router)
- **Role**: Evaluates the domain of the intent: `EMERGENCY`, `HEALTHCARE`, `ENVIRONMENT`, `SOCIAL_AID`, or `GENERAL`.
- **Core Logic**: Performs zero-shot classification based on societal benefit metrics.
- **Goal**: Ensure the intent is handled by the correct downstream logic.

### 🏥 3. The Action Strategist (Life-Saving Logic)
- **Role**: Formulates high-impact, verified steps based on the categorized data.
- **Core Logic**: Converts unstructured extracted data into specific payloads:
  - `call`: For urgent dialing.
  - `map`: For geographic routing.
  - `form`: For record-keeping or incident reporting.
  - `info`: For critical knowledge transfer.
- **Goal**: Provide an actionable path forward for every human intent.

### 🔮 4. The Reasoning Oracle (Explainability Agent)
- **Role**: Provides the "why" behind every decision.
- **Core Logic**: Self-reflects on its analysis to provide a human-readable explanation of why a specific urgency or category was assigned.
- **Goal**: Build trust through transparency.

### 🗄️ 5. The Archivist (Persistence Agent)
- **Role**: Ensures every analyzed intent is etched into permanent memory.
- **Core Logic**: Located in `src/services/firestoreService.ts`.
- **Primary Tooling**: Google Firebase Firestore.
- **Goal**: Maintain a verifiable audit trail for responders and NGOs.

### 🔐 6. The Gatekeeper (Identity & Truth)
- **Role**: Secures access to the system using real-world identities.
- **Core Logic**: Located in `src/context/AuthContext.tsx` and `src/components/LoginScreen.tsx`.
- **Primary Tooling**: Google OAuth 2.0 (`@react-oauth/google`).
- **Goal**: Validate users securely without heavy backend auth logic.


---

## 🧠 Data Architecture (For AI Agents)

When building new features or integrating with the engine, adhere to these schemas found in `src/types/index.ts`:

### `BridgeResult`
The output contract for every intent process:
```typescript
interface BridgeResult {
  category: BridgeCategory;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string;
  detectedLanguage: string;
  structuredData: Record<string, any>;
  actions: BridgeAction[];
  reasoning: string;
}

```

### `BridgeAction`
Defines an actionable outcome the user can take:
```typescript
interface BridgeAction {
  title: string;
  description: string;
  type: "call" | "map" | "form" | "info";
  payload: string; // Phone number, address, URL, or data
}
```

---

## ⚡ Assistant Onboarding (Quick Start for AI)

If you are an AI assistant starting a new task in this repo, follow these steps:
1. **Intelligence Check**: Review `SYSTEM_INSTRUCTION` in `src/services/gemini.ts` to understand how the engine thinks.
2. **UI Orchestration**: Check `handleProcess` in `src/App.tsx` and the components in `src/components/` to see how the frontend interacts with the engine.
3. **Execution Pattern**: 
   - Use `npm run dev` to start the local environment.
   - Use `npm run test` to validate any logic changes before submitting.
4. **Design Philosophy**: Refer to `src/index.css` for the "Glitch-Futurism" and "Glassmorphism" styling tokens. Adhere to strict accessibility guidelines by utilizing `skip-link`, clear `:focus-visible` styling, and `.scan-line` reduced motion preferences.

---

## 🚀 Deployment Protocol
### 1. First-time GCP Setup (One-time)
```bash
# Set project and enable APIs
export PROJECT_ID="gen-lang-client-0910567027"
gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# Create the container repository
gcloud artifacts repositories create omnibridge-repo \
  --repository-format=docker --location=us-central1
```

### 2. Deployment (Every Change)
```bash
export PROJECT_ID="gen-lang-client-0910567027"
export GEMINI_KEY=$(grep GEMINI_API_KEY .env | cut -d= -f2)
export MAPS_KEY=$(grep VITE_GOOGLE_MAPS_API_KEY .env | cut -d= -f2 | tr -d '"'\'''\'''\')
export FB_API_KEY=$(grep VITE_FIREBASE_API_KEY .env | cut -d= -f2 | tr -d '"'\'''\'''\')
export FB_AUTH_DOMAIN=$(grep VITE_FIREBASE_AUTH_DOMAIN .env | cut -d= -f2 | tr -d '"'\'''\'''\')
export FB_PROJECT_ID=$(grep VITE_FIREBASE_PROJECT_ID .env | cut -d= -f2 | tr -d '"'\'''\'''\')
export FB_STORAGE_BUCKET=$(grep VITE_FIREBASE_STORAGE_BUCKET .env | cut -d= -f2 | tr -d '"'\'''\'''\')
export FB_SENDER_ID=$(grep VITE_FIREBASE_MESSAGING_SENDER_ID .env | cut -d= -f2 | tr -d '"'\'''\'''\')
export FB_APP_ID=$(grep VITE_FIREBASE_APP_ID .env | cut -d= -f2 | tr -d '"'\'''\'''\')

# Build image in the cloud
gcloud builds submit --config cloudbuild.yaml --substitutions="_GEMINI_API_KEY=$GEMINI_KEY,_VITE_GOOGLE_MAPS_API_KEY=$MAPS_KEY"

# Deploy to Cloud Run
gcloud run deploy omnibridge \
  --image "us-central1-docker.pkg.dev/$PROJECT_ID/omnibridge-repo/omnibridge:latest" \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "GEMINI_API_KEY=$GEMINI_KEY,\
VITE_FIREBASE_API_KEY=$FB_API_KEY,\
VITE_FIREBASE_AUTH_DOMAIN=$FB_AUTH_DOMAIN,\
VITE_FIREBASE_PROJECT_ID=$FB_PROJECT_ID,\
VITE_FIREBASE_STORAGE_BUCKET=$FB_STORAGE_BUCKET,\
VITE_FIREBASE_MESSAGING_SENDER_ID=$FB_SENDER_ID,\
VITE_FIREBASE_APP_ID=$FB_APP_ID"

```

---

## 🔮 Future Agentic Enhancements (TODOs)

- [x] **Voice Dictation Agent**: Native integration of real-time Speech-to-Text (STT).
- [x] **Multilingual Intake**: Zero-shot detection and localized response generation.
- [x] **Geospatial Intent Routing**: Embedded interactive Google Maps dynamically visualize safe-zones and extraction points.
- [x] **Persistent Intent Archivist**: Native Firestore integration for long-term intelligence storage.
- [x] **Identity Verification**: Integrated Google OAuth 2.0 for user authentication and session management.

- [ ] **Voice Synthesis Agent**: Native integration of Text-to-Speech (TTS).

- [ ] **Geofence Automator**: Autonomous retrieval of local NGO and medical facility APIs.
- [ ] **Task Orchestrator**: Moving from suggestion to direct execution of multi-step workflows.

---

*This document serves as the ground truth for the OmniBridge Agentic Architecture.*
