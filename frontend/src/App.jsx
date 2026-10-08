import { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 async function askQuestion() {
  if (!question.trim()) {
    return;
  }

  setLoading(true);
  setError("");
  setAnswer("");
  setSources([]);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Something went wrong"
      );
    }

    setAnswer(data.answer);
    setSources(data.sources || []);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

  return (
    <div>
      <h1>ASTU RAG Assistant</h1>

      <input
        type="text"
        value={question}
        onChange={(event) =>
          setQuestion(event.target.value)
        }
        placeholder="Ask a question..."
      />

      <button
        onClick={askQuestion}
        disabled={loading}
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      {error && (
        <p>{error}</p>
      )}

      {answer && (
        <div>
          <h2>Answer</h2>
          <p>{answer}</p>
        </div>
      )}

      {sources.length > 0 && (
        <div>
          <h2>Sources</h2>

          {sources.map((source, index) => (
            <div key={index}>
              <p>
                <strong>{source.section}</strong>
              </p>

              <p>
                Similarity: {source.score.toFixed(3)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;