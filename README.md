# ArticulusDock

A seamless read-later platform to save, organize, and sync articles from across the web.

## 🚀 Features

- **AI-Powered Extraction:** Automatically extracts titles, excerpts, and content from any URL using Gemini AI.
- **Smart Dashboard:** A beautiful, responsive interface to manage your reading list.
- **Duplicate Detection:** Prevents saving the same article twice with a smart warning system.
- **Collections:** Organize your articles into custom groups (e.g., Tech, Research, Design).
- **Read Mode:** A distraction-free reading environment with adjustable typography.
- **Real-time Sync:** Powered by Firebase for instant updates across all your devices.
- **Browser Extension Support:** Save articles directly from your browser with the ArticulusDock extension.
- **Dark Mode:** A sleek, high-contrast dark theme for comfortable reading at night.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **Database & Auth:** Firebase (Firestore & Authentication)
- **AI Engine:** Google Gemini AI (@google/genai)
- **Icons:** Lucide React

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or later)
- A Firebase project
- A Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd articulusdock
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

4. Add your Firebase configuration:
   Ensure `firebase-applet-config.json` is present in the root directory with your project details.

### Development

Run the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 🛡️ Security

ArticulusDock uses Firebase Security Rules to ensure that your data is private and only accessible by you. Authentication is handled via Google Login.

## 📄 License

This project is licensed under the MIT License.
