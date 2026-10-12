import { useState, useRef, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rag_user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("rag_token") || ""
  );

  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function logout() {
    localStorage.removeItem("rag_token");
    localStorage.removeItem("rag_user");

    setToken("");
    setUser(null);
    setPassword("");
    setQuestion("");
    setMessages([]);
    setHistory([]);
    setDocuments([]);
    setError("");
    setUploadMessage("");
  }

  async function submitAuth(event) {
    event.preventDefault();
    setError("");
    setAuthLoading(true);

    try {
      const endpoint =
        authMode === "register" ? "/api/auth/register" : "/api/auth/login";

      const body =
        authMode === "register"
          ? { name, email, password }
          : { email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (authMode === "register") {
        setAuthMode("login");
        setPassword("");
        setError("");
        alert("Registration successful. Please log in.");
        return;
      }

      localStorage.setItem("rag_token", data.token);
      localStorage.setItem("rag_user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  
async function askQuestion(event) {
  event?.preventDefault();

  const currentQuestion = question.trim();

  if (!currentQuestion || loading) return;

  setQuestion("");
  setError("");
  setLoading(true);

  const updatedHistory = [
    ...history,
    { role: "user", content: currentQuestion }
  ];

  setMessages((previous) => [
    ...previous,
    { role: "user", content: currentQuestion },
    {
      role: "assistant",
      content: "",
      sources: [],
      streaming: true
    }
  ]);

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        question: currentQuestion,
        history
      })
    });

    if (response.status === 401) {
      logout();
      throw new Error("Your session expired. Please log in again.");
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to get an answer.");
    }

    if (!response.body) {
      throw new Error("Streaming is not supported by this response.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let answer = "";
    let sources = [];
    let streamError = "";

    function updateAssistantMessage(content, nextSources, streaming) {
      setMessages((previous) => {
        const updated = [...previous];
        const assistantIndex = updated.length - 1;

        if (
          assistantIndex < 0 ||
          updated[assistantIndex].role !== "assistant"
        ) {
          return previous;
        }

        updated[assistantIndex] = {
          ...updated[assistantIndex],
          content,
          sources: nextSources,
          streaming
        };

        return updated;
      });
    }

    function processEvent(eventText) {
      const dataLines = eventText
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart());

      if (dataLines.length === 0) return;

      let data;

      try {
        data = JSON.parse(dataLines.join("\n"));
      } catch {
        return;
      }

      if (data.type === "chunk") {
        answer += data.text || "";
        updateAssistantMessage(answer, sources, true);
      } else if (data.type === "sources") {
        sources = data.sources || [];
        updateAssistantMessage(answer, sources, true);
      } else if (data.type === "error") {
        streamError = data.message || "Failed to generate an answer.";
      } else if (data.type === "done") {
        updateAssistantMessage(answer, sources, false);
      }
    }

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || "";

      for (const eventText of events) {
        if (eventText.trim()) processEvent(eventText);
      }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
      processEvent(buffer);
    }

    if (streamError) {
      throw new Error(streamError);
    }

    setHistory([
      ...updatedHistory,
      { role: "assistant", content: answer }
    ]);
  } catch (err) {
    setError(err.message);

    setMessages((previous) => {
      const updated = [...previous];

      if (updated.at(-1)?.role === "assistant") {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          streaming: false
        };
      }

      return updated;
    });
  } finally {
    setLoading(false);
  }

 }
  async function loadDocuments() {
    if (!token || user?.role !== "admin") return;

    setDocumentsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/upload/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        throw new Error("Your session expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load documents.");
      }

      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setDocumentsLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "admin" && token) {
      loadDocuments();
    }
  }, [user?.role, token]);

  async function uploadDocument(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setUploadMessage("");

    const extension = file.name.toLowerCase().split(".").pop();

    if (!["txt", "pdf"].includes(extension)) {
      setError("Choose a .txt or .pdf file.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("document", file);

    setUploading(true);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        throw new Error("Your session expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Document upload failed.");
      }

      setUploadMessage(
        `${data.filename} indexed successfully (${data.chunks} chunks).`
      );

      await loadDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function removeDocument(filename) {
    const confirmed = window.confirm(
      `Remove "${filename}" from the RAG knowledge base?`
    );

    if (!confirmed) return;

    setError("");
    setUploadMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/upload/documents/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        throw new Error("Your session expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Document deletion failed.");
      }

      setUploadMessage(`${filename} removed from the knowledge base.`);
      await loadDocuments();
    } catch (err) {
      setError(err.message);
    }
  }

  function clearConversation() {
    if (loading) return;

    setQuestion("");
    setMessages([]);
    setHistory([]);
    setError("");
  }

  if (!token || !user) {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={submitAuth}>
          <div className="auth-logo">🤖</div>
          <h1>ASTU MSJAssistant</h1>
          <p className="auth-subtitle">
            Sign in to ask questions about ASTU MSJ Bootcamp.
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={authMode === "login" ? "active" : ""}
              onClick={() => {
                setAuthMode("login");
                setError("");
              }}
            >
              Login
            </button>

            <button
              type="button"
              className={authMode === "register" ? "active" : ""}
              onClick={() => {
                setAuthMode("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>

          {authMode === "register" && (
            <label>
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button
            className="primary-button"
            type="submit"
            disabled={authLoading}
          >
            {authLoading
              ? "Please wait..."
              : authMode === "register"
                ? "Create account"
                : "Login"}
          </button>

          <p className="auth-footer">
            Admin accounts must be created through the backend admin setup
            script.
          </p>
        </form>
      </div>
    );
  }

  if (user.role === "admin") {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>ASTU RAG Admin</h1>
            <p>Welcome, {user.name}</p>
          </div>
          <button className="secondary-button" onClick={logout}>
            Logout
          </button>
        </header>

        <main className="admin-main">
          <section className="admin-card">
            <h2>Upload knowledge documents</h2>
            <p>Upload a text file or a PDF to make its content searchable.</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,text/plain,application/pdf"
              onChange={uploadDocument}
              disabled={uploading}
            />

            {uploading && <p>Uploading and creating embeddings...</p>}
            {uploadMessage && (
              <div className="upload-success">{uploadMessage}</div>
            )}
            {error && <div className="error">{error}</div>}
          </section>

          <section className="admin-card">
            <div className="section-heading">
              <div>
                <h2>Indexed documents</h2>
                <p>Documents currently available to the RAG assistant.</p>
              </div>
              <button
                className="secondary-button"
                onClick={loadDocuments}
                disabled={documentsLoading}
              >
                {documentsLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {documents.length === 0 && !documentsLoading ? (
              <p>No indexed documents found.</p>
            ) : (
              <div className="document-list">
                {documents.map((document) => (
                  <article
                    className="document-item"
                    key={document.filename}
                  >
                    <div>
                      <strong>{document.filename}</strong>
                      <p>
                        {document.chunks} chunks
                        {document.sections?.length
                          ? ` · ${document.sections.length} sections`
                          : ""}
                      </p>
                    </div>
                    <button
                      className="danger-button"
                      onClick={() => removeDocument(document.filename)}
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div className="brand-icon">🤖</div>

        <div>
          <h1>ASTU MSJ Assistant</h1>
          <p>Welcome, {user.name}</p>
        </div>

        <button className="clear-button" onClick={clearConversation}>
          New chat
        </button>
        <button className="secondary-button" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="chat-main">
        {messages.length === 0 && (
          <section className="welcome">
            <h2>How can I help you today?</h2>
            <p>
              Ask questions about registration, assignments, attendance,
              and programming practice.
            </p>
          </section>
        )}

        <section className="messages">
          {messages.map((message, index) => (
            <article className={`message ${message.role}`} key={index}>
              <div className="avatar">
                {message.role === "user" ? "👤" : "🤖"}
              </div>

              <div className="message-content">
                <strong>
                  {message.role === "user" ? "You" : "ASTU MSJ Assistant"}
                </strong>
                <p>{message.content}</p>

                {message.role === "assistant" &&
                  message.sources?.length > 0 && (
                    <details className="sources">
                      <summary>Sources ({message.sources.length})</summary>

                      {message.sources.map((source, index) => (
                        <div
                          className="source"
                          key={`${source.source}-${source.section}-${index}`}
                        >
                          <strong>
                            {source.section || source.source}
                          </strong>
                          <span>
                            Score: {Number(source.score).toFixed(3)}
                          </span>
                        </div>
                      ))}
                    </details>
                  )}
              </div>
            </article>
          ))}

          {loading && (
            <div className="typing">🤖 Assistant is thinking...</div>
          )}

          {error && <div className="error">{error}</div>}
          <div ref={bottomRef} />
        </section>
      </main>

      <form className="chat-form" onSubmit={askQuestion}>
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Message ASTU MSJ Assistant..."
          disabled={loading}
        />

        <button type="submit" disabled={loading || !question.trim()}>
          {loading ? "..." : "Send ↑"}
        </button>

        <small>Answers are based on the indexed knowledge documents.</small>
      </form>
    </div>
  );
}

export default App;