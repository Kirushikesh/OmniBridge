<div align="center">
  <img width="1200" height="475" alt="OmniBridge Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  # 🚀 OmniBridge — Universal Intent Engine
  
  **Transforming messy human intent into structured, life-saving actions.**
  
  [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
  [![Version](https://img.shields.io/badge/Version-1.0.4--alpha-green.svg)]()
  [![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4.svg)]()
</div>

---

## 🌟 The Vision

**OmniBridge** is a Gemini-powered engine designed for societal benefit. It acts as a universal bridge between messy, unstructured real-world inputs and complex systems. Whether it's a voice note from a disaster zone, a blurry photo of medical symptoms, or a chaotic traffic report, OmniBridge converts them into structured, verified, and life-saving actions.

## 🛠 Features

- **Multimodal Intelligence**: Seamlessly processes text, images, and audio descriptions.
- **Urgency-Aware Routing**: Autonomously prioritizes intents from `LOW` to `CRITICAL` for rapid response.
- **Real-Time Grounding**: Utilizes native **Google Search** integrations to verify intelligence, keeping processing constrained to accurate, real-world data points.
- **Multilingual Support**: Automatically detects the user's input language and provides 100% localized responses for all descriptive fields.
- **Secure & Accessible by Default**: Ships with strict CSP rules, a robust 2,500-character input overflow constraint, logical focus-flow structures, and comprehensive reduced-motion fallbacks.
- **Geospatial Intent Routing**: Embedded interactive Google Maps dynamically visualize safe-zones and extraction points.
- **Persistent Intent Storage**: Securely archives all analyzed intents and results in **Google Cloud Firestore** for long-term NGO and responder review.
- **Identity & Access**: Secured directly via **Google OAuth 2.0** for seamless, trusted authentication.

### 🌐 Google Services Ecosystem

OmniBridge is heavily integrated with the Google Cloud and Google Workspace platforms to ensure enterprise-grade reliability, security, and intelligence:

1. **Google Gemini API**: Our core reasoning engine. Uses `gemini-3-flash-preview` for multimodal reasoning and zero-shot categorization.
2. **Google OAuth 2.0 (`@react-oauth/google`)**: Powers our robust, secure, and seamless authentication layer without needing custom backend auth logic.
3. **Google Search Grounding**: Integrated directly into Gemini's toolset to ensure the AI's responses are verified against live, real-world data to prevent hallucinations.
4. **Google Maps Embed API**: Used to dynamically render geospatial coordinates and safe-zone routes directly in the user interface.
5. **Google Cloud Firestore**: Provides a persistent, schema-less NoSQL database to store analyzed intents for future audits and responder review.
6. **Google Cloud Run**: Serverless container execution environment that hosts our production deployment with auto-scaling capabilities.
7. **Google Cloud Build & Artifact Registry**: Our CI/CD pipeline and container image storage for zero-downtime deployments.


- **Categorical Specialization**:
  - 🚨 **Emergency**: Disaster response and incident reporting.
  - 🏥 **Healthcare**: Symptom analysis and medical triage (AI-assisted).
  - 🌱 **Environment**: Ecological monitoring and hazard detection.
  - 🤝 **Social Aid**: Community support and resource allocation.
- **Structured Extraction**: Extracts locations, entities, and deep context with surgical precision.
- **System Reasoning**: Transparent decision-making provided by a specialized Reasoning Oracle.

## 🚀 Live Access

- **Production Deployment**: [OmniBridge on Google Cloud Run](https://omnibridge-850814526387.us-central1.run.app)
- **AI Studio Preview**: [Explore in AI Studio](https://ai.studio/apps/d602baee-4414-4303-9631-bc807ab0e25a)

---

## 💻 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Intelligence**: [Google Gemini API](https://ai.google.dev/) (`gemini-3-flash-preview`)
- **Persistence**: [Google Firebase Firestore](https://firebase.google.com/)
- **Authentication**: [Google OAuth 2.0](https://developers.google.com/identity/oauth2/web/guides/overview)
- **Deployment**: [Google Cloud Run](https://cloud.google.com/run) | [Artifact Registry](https://cloud.google.com/artifact-registry)


---

## 🛠 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Google Cloud SDK](https://cloud.google.com/sdk) (for deployment)

### Local Development

1. **Clone and Install**:
   ```bash
   npm install
   ```
2. **Configure Environment**:
   Create a `.env` file and add your API Keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_embed_key_here
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
4. **Run Tests**:
   ```bash
   npm run test
   ```

---

## 🏗 Future Roadmap

- [x] **Voice Dictation**: Native STT (Speech-to-Text) via Web Speech API for hands-free intake.
- [x] **Geospatial Routing**: Real-time iframe mapping of Google Maps Embed API.
- [x] **Persistent Storage**: Automated Firestore archiving for every processed intent.

- [ ] **Voice Synthesis**: TTS (Text-to-Speech) for hands-free interaction.
- [ ] **Geofencing**: Automatic location-based task routing for local emergency services.
- [ ] **Automated Actions**: Direct integration with service APIs (Emergency calling, medical form submission).
- [ ] **Offline Priority**: Lightweight on-device processing for low-connectivity environments.
- [ ] **Enhanced Accessibility**: Advanced screen-reader support and multi-language haptics.

---

## 📄 License

This project is licensed under the Apache-2.0 License.

---

## 🚀 Deployment

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

<div align="center">
  <p font-family="monospace"><b>SYST3M STATUS: OPERATIONAL</b></p>
</div>
