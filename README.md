<<<<<<< HEAD

# Sahaayak – Your Wellness Companion 🌸

**Sahaayak (सहायक)**, meaning "helper" or "assistant," is a modern, desktop-friendly mental wellness application designed to be a safe and supportive companion for students and youth in India. It provides a confidential, culturally relevant space for users to track their emotional well-being, learn coping mechanisms, and connect with an AI-powered guide.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

 <!-- Placeholder: Replace with an actual screenshot URL -->

## ✨ Key Features

Sahaayak is packed with features designed to provide holistic mental wellness support:

- **🔐 Secure Authentication:** Supports both registered accounts and an anonymous guest mode for privacy.
- **🌐 Multilingual & Thematic:** Full support for **English, Hindi (हिन्दी), and Bengali (বাংলা)**. Includes multiple UI themes (Light, Dark, Warm, Cool) to suit user preference.
- **🤖 AI Companion (Gemini API):**
  - An empathetic chatbot powered by **Google's Gemini API**.
  - **Dynamic Persona:** The AI can adapt its personality (e.g., Calm Guide, Motivational Coach) based on the conversation's context.
  - **Crisis Detection:** Automatically detects high-risk distress messages and suggests the Emergency section.
- **🏠 Personalized Dashboard:** A central hub that provides an at-a-glance view of your wellness journey, including mood trends, daily insights, habit streaks, and quick actions.
- **😊 Mood Tracking:** Log your daily mood with context (activities, social interactions, notes). Visualize your emotional patterns over time with charts and a calendar view.
- **✍️ AI-Powered Journaling:** A private space to write down your thoughts. The AI can provide gentle insights based on your entries and detect signs of distress.
- **🧘 Wellness Exercises:** A curated library of guided exercises, including:
  - Box Breathing
  - 5-4-3-2-1 Grounding Technique
  - Guided Meditation
  - Thought Reframing (Cognitive Restructuring)
- **🌱 Wellness Journeys:** Structured, multi-day programs like "7 Days of Mindfulness" to help users build lasting positive habits.
- **🎯 Intentions & Habits:** A goal-setting feature where users can define, track, and get AI-powered suggestions for small, achievable wellness goals.
- **🏆 Gamification:** Earn badges and maintain streaks for consistent engagement with mood tracking, journaling, and completing journeys.
- **🚨 Emergency Support:** A dedicated, easily accessible section with:
  - One-tap calling for pre-filled, verified Indian mental health helplines.
  - Space for users to add up to 3 personal emergency contacts.

## 🛠️ Tech Stack

This project leverages a modern, frontend-focused tech stack.

- **Frontend:** React, TypeScript, React Router
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Styling:** Tailwind CSS (via CDN), CSS Variables for robust theming.
- **State Management:** React Context API
- **Data Visualization:** Recharts
- **Internationalization (i18n):** `i18next` & `react-i18next`
- **Database (Conceptual):** The application is designed around a **PostgreSQL** schema. For this frontend-only demo, the database is mocked using the `localStorage` API.

## 📂 Folder Structure

The project follows a standard React application structure:

```
/
├── public/
│   └── locales/              # i18n translation files (en, hi, bn)
├── src/
│   ├── components/           # Reusable UI components (e.g., AuthenticatedLayout.tsx)
│   ├── context/              # Global state management (AppContext.tsx)
│   ├── pages/                # Top-level route components (Dashboard, Chat, etc.)
│   ├── services/             # API clients and data services (geminiService.ts, database.ts)
│   ├── App.tsx               # Main application component with routing
│   ├── constants.tsx         # App-wide constants (icons, options, etc.)
│   ├── i18n.ts               # i18next configuration
│   ├── index.tsx             # Application entry point
│   └── types.ts              # TypeScript type definitions
├── index.html                # Main HTML file with importmap
├── metadata.json             # Project metadata and permissions
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox).
- A Google Gemini API Key.

### Environment Setup

1.  This project requires a Google Gemini API key to function. Create a file named `.env` in the root of the project.
2.  Add your API key to the `.env` file as follows:

    ```
    API_KEY=your_gemini_api_key_here
    ```
    > **Note:** In a real-world bundled application (e.g., using Vite), you would typically prefix this with `VITE_` (e.g., `VITE_API_KEY`) and access it via `import.meta.env.VITE_API_KEY`. The current setup assumes an environment where `process.env.API_KEY` is made available to the frontend.

### Installation & Running

This project uses an `importmap` in `index.html` to load dependencies directly from a CDN, so **no `npm install` is required**.

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/sahaayak.git
    cd sahaayak
    ```
2.  Serve the project folder using a simple local server. A great option is the `serve` package:
    ```bash
    npx serve
    ```
3.  Open your browser and navigate to the local URL provided by the server (e.g., `http://localhost:3000`).

## 📖 Usage Guide

1.  **Onboarding:** Upon first visit, you'll be guided through a quick setup process to choose your language, nickname, avatar, and default AI persona. You can also choose to proceed as a guest.
2.  **Dashboard:** This is your main hub. From here, you can perform a quick mood check-in, see AI-generated insights, access coping tools, and view your progress.
3.  **Chat with Sahaayak:** Use the sidebar to navigate to the Chat page to talk with your AI companion anytime.
4.  **Explore Tools:** Use the main navigation or the "Coping Toolkit" widget to navigate to features like **Exercises**, **Journal**, and **Wellness Journeys**.
5.  **Emergency:** The "Emergency" link in the sidebar is always available to connect you with helplines or your personal contacts.

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve Sahaayak, please follow these steps:

1.  **Fork** the repository on GitHub.
2.  **Clone** your forked repository to your local machine.
3.  Create a new **branch** for your feature or bug fix (`git checkout -b feature/your-feature-name`).
4.  Make your changes and **commit** them with clear, descriptive messages.
5.  **Push** your changes to your fork on GitHub.
6.  Submit a **Pull Request** to the `main` branch of the original repository.

Please ensure your code follows the existing style and that you update the relevant translation files in `public/locales/` if you add or change any user-facing text.

## 📜 License

This project is licensed under the **MIT License**.

## 📧 Contact & Support

For any issues, bug reports, or feature requests, please [open an issue](https://github.com/your-username/sahaayak/issues) on the GitHub repository.
=======
# sahaayak-app
Sahaayak – AI-powered youth mental wellness app built with Google Cloud Generative AI.
>>>>>>> 89c1f5a8c86309741f93fd2422d9da1fb4c15d9d
