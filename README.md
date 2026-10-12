# ASUT MSJ Assistant

An AI-powered assistant for the ASTU MSJ Bootcamp that helps students find information from project knowledge documents using Retrieval-Augmented Generation (RAG).

## 📸 Application Preview

![ASUT MSJ Assistant Preview](frontend/assets/preview.png)

## 📖 Overview

ASUT MSJ Assistant is a full-stack JavaScript application designed to make bootcamp information easier to access. Instead of manually searching documents or repeatedly asking the same questions, users can ask questions in natural language and receive answers grounded in relevant information retrieved from the knowledge base.

The project implements Retrieval-Augmented Generation (RAG), combining semantic search, document retrieval, and a Large Language Model (LLM) to generate context-aware responses.

## 🎯 Problems This Project Solves

- **Scattered information:** Makes information stored in knowledge documents easier to find.
- **Repeated questions:** Helps answer common questions about registration, assignments, attendance, and programming practice.
- **Time-consuming searches:** Lets users ask questions directly instead of manually searching documents.
- **Context-aware answers:** Retrieves relevant text before generating a response.
- **Document accessibility:** Supports uploading and managing knowledge documents through an admin interface.

## ✨ Features

- User registration and login
- JWT-based authentication
- Role-based access for protected features
- Admin dashboard for document management
- Document upload and deletion
- PDF and text document processing
- Text chunking for retrieval
- Embedding generation and semantic similarity search
- Gemini-powered answer generation
- Streaming responses for a more interactive chat experience
- Source information accompanying answers
- Conversation history sent with chat requests
- Responsive web interface

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- JavaScript
- HTML and CSS
- Fetch API for backend communication

### Backend
- Node.js
- Express.js
- MongoDB and Mongoose
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- Multer for file uploads
- pdf-parse for PDF processing

### AI and RAG
- Google Gemini API via `@google/genai`
- Text embeddings for semantic retrieval
- Vector similarity search
- Context-grounded answer generation
- Server-Sent Events (SSE) for streaming, where configured

### Deployment and Tools
- Git and GitHub
- Render for backend hosting
- Vercel for frontend hosting
- MongoDB Atlas for cloud database hosting

## 🧠 How RAG Works

1. **Document ingestion:** An administrator uploads a supported knowledge document.
2. **Text extraction:** Text is extracted from the uploaded document.
3. **Chunking:** The text is split into smaller sections.
4. **Embedding generation:** Text chunks are converted into numerical embeddings.
5. **Question processing:** A user's question is converted into an embedding.
6. **Retrieval:** Relevant chunks are identified using semantic similarity.
7. **Answer generation:** Retrieved context is sent to Gemini to generate an answer.
8. **Response delivery:** The answer is returned to the user, along with source information when available.

## 🏗️ Architecture

```text
React + Vite Frontend
        |
        | HTTP / JSON / SSE
        v
Node.js + Express API
        |
        +---- Authentication (JWT)
        |
        +---- Document Processing
        |
        +---- RAG Retrieval Service
        |          |
        |          +---- Embeddings and Similarity Search
        |
        +---- Gemini Answer Generation
        |
        +---- MongoDB Atlas
```

## 📂 Project Structure

```text
rag-js/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── services/
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   └── package.json
└── README.md
```

*

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB database or MongoDB Atlas account
- A Google Gemini API key
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Musa-Abdusamed/rag-js.git
cd rag-js
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` using the variable names expected by your code:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_long_random_secret
```

Never commit `.env` or expose API keys in the frontend.

Start the backend in development mode:

```bash
npm run dev
```

The backend should start on the configured port, commonly `http://localhost:5000`.

### 3. Configure the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## 🔐 Security Notes

- Keep API keys, database credentials, and JWT secrets private.
- Store secrets in environment variables rather than source code.
- Hash passwords before storing them.
- Protect private API routes with authentication and authorization middleware.
- Validate uploaded files and user input.
- Configure CORS to allow only trusted frontend origins in production.
- Never put server-only secrets in `VITE_` frontend variables.

## ⚠️ Challenges and Lessons Learned

### 1. Semantic Retrieval

A RAG assistant needs to retrieve relevant information, not just text containing the exact words from a question. Embeddings and similarity search help match questions with semantically related document chunks.

### 2. Chunking Documents

Chunks that are too large can include irrelevant content, while chunks that are too small can lose context. Chunk size and overlap need to be adjusted to the document collection.

### 3. LLM API Quotas

Free API tiers can impose usage limits or temporarily return rate-limit and service-unavailable errors. The application needs clear error handling and sensible retry behavior.

### 4. Streaming Responses

Streaming requires the backend and frontend to agree on an event format and handle partial responses, completion events, and errors correctly.

### 5. Deployment Configuration

Deploying the frontend and backend separately requires correct environment variables, API URLs, CORS settings, and database connectivity.

### 6. Grounded Answers

A language model can produce incorrect information when relevant context is missing. Retrieval quality, source visibility, and clear fallback behavior are important for improving trustworthiness.

## 🔮 Future Improvements

- Support additional document formats
- Improve retrieval quality with hybrid search and reranking
- Add conversation persistence across sessions
- Add document-level access permissions
- Improve source citations with page numbers and clickable references
- Add automated tests and CI/CD checks
- Add rate limiting and stronger production monitoring
- Improve accessibility and mobile responsiveness
- Add analytics for frequently asked questions

## 🌍 Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **AI model and embeddings:** Google Gemini API

Set production environment variables in the hosting dashboards. Do not commit production secrets to GitHub.

## 👨‍💻 Author

**Musa Abdusamed**

GitHub: [@Musa-Abdusamed](https://github.com/Musa-Abdusamed)


## 🌐 Live Demo

🚀 **Try ASUT MSJ Assistant here:**

👉 [Open Live Demo](https://astu-msj-assistant.vercel.app/)

Explore the application and experience how AI-powered Retrieval-Augmented Generation (RAG) helps users find information about the ASTU MSJ Bootcamp.

> **Note:** The backend may take a little time to respond after a period of inactivity because it is hosted on Render's free tier.



---

Built to make bootcamp knowledge easier to access through AI-powered retrieval.
