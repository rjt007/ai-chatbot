# Ibn Sina AI Chatbot (MERN Stack)

A sophisticated full-stack AI chatbot featuring the historical persona of **Ibn Sina (Avicenna)**—the renowned 11th-century Persian polymath. This application is built using the MERN stack (MongoDB, Express, React, Node.js) and powered by the Google Gemini API.

The UI features a deeply integrated **Dynamic Color Engine** that algorithmically alters the application's interface colors based on mathematical interpolations, textual sentiment analysis, and exact city temperatures extracted dynamically from the user's conversational input!

## ✨ Features

- **The Ibn Sina Persona**: The AI generates scholarly, philosophical responses in dual-language formats (Arabic script followed by English translations).
- **Dynamic Color Engine**:
  - **Rule 1 (City + Temp)**: Interpolates temperatures between Blue (0°C), Purple (15°C), and Red (35°C).
  - **Rule 2 (Decimals)**: Detects precision mathematical inputs and switches to a grayscale Sepia contrast mode.
  - **Rule 3 (Sentiment Urgency)**: Uses Gemini to evaluate the "Urgency" or "Panic" of a message from 1-10, interpolating the UI background from calm Yellow (0) to emergency Violet (10).
- **WCAG Accessibility**: An integrated luminance engine recalculates standard text contrast in real-time, automatically flipping text to solid Black or pure White depending on the algorithmic background color to guarantee 100% WCAG compliance.
- **Secure Authentication**: Robust JWT token-based login and signup architecture built with Express.

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Vanilla CSS/Glassmorphism, Axios
- **Backend**: Node.js, Express.js, Helmet, Express-Rate-Limit, CORS
- **Database**: MongoDB (Mongoose)
- **AI Integrations**: Google Gemini API (`@google/genai` SDK - `gemini-2.5-flash`)

## 🚀 Running Locally

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/rjt007/ai-chatbot.git
cd ai-chatbot
\`\`\`

### 2. Setup the Backend
Navigate to the \`server\` directory, install dependencies, and configure your environment variables.
\`\`\`bash
cd server
npm install
\`\`\`

Create a \`.env\` file in the \`server\` directory:
\`\`\`bash
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL=gemini-2.5-flash
\`\`\`

Start the backend:
\`\`\`bash
npm run dev
\`\`\`

### 3. Setup the Frontend
Open a new terminal, navigate to the \`client\` directory, and start the Vite development server.
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

The app will now be running at \`http://localhost:3000\`!

## 🌍 Deployment Architecture

This monorepo is completely configured to be deployed as a split architecture for maximum performance and minimum edge latency:
- **Frontend**: Deploy the `/client` directory directly to **Vercel**. Ensure you set the `VITE_API_URL` environment variable to point to your hosted backend API.
- **Backend**: Deploy the `/server` directory to **Render** as a long-running Node.js Web Service. Add your Vercel URL to the Express `cors` origin array dynamically.

## 🧪 Testing

The backend comes fully equipped with a robust Jest suite validating the Color Engine interpolations and routing logic:
\`\`\`bash
cd server
npm test
\`\`\`
