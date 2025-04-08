import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const AskAI = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [theme, setTheme] = useState("light");

  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setChatHistory(savedHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem("chatHistory");
  };

  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion("");

    setChatHistory((prev) => [...prev, { type: "user", content: currentQuestion }]);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCwAkj_iddVOxgbaNx6B1pcT0NgbYqPzCY`,
        {
          contents: [{ parts: [{ text: currentQuestion }] }],
        }
      );

      const aiResponse =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no response received.";

      setChatHistory((prev) => [...prev, { type: "ai", content: aiResponse }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setChatHistory((prev) => [
        ...prev,
        { type: "ai", content: "Sorry - Something went wrong. Please try again!" },
      ]);
    }

    setGeneratingAnswer(false);
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => alert("Copied to clipboard!"),
      (err) => alert("Failed to copy: " + err)
    );
  };

  const themeStyles = {
    light: {
      background: "bg-[#F5EFFF]",
      text: "text-gray-800",
      chatBubble: "bg-white text-gray-800",
      input: "bg-white border-gray-300 text-gray-800",
    },
    dark: {
      background: "bg-gray-900",
      text: "text-gray-200",
      chatBubble: "bg-gray-700 text-gray-200",
      input: "bg-gray-800 border-gray-600 text-gray-200",
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <div className={`fixed inset-0 ${currentTheme.background}`}>
      <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
        <header className="flex justify-between items-center py-4">
          <h1 className="text-4xl font-bold" style={{ color: "#7E60BF", transition: "color 0.3s" }}>
            Doctor AI
          </h1>
          <div className="flex gap-3">
            <button onClick={toggleTheme} className={`px-4 py-2 rounded-lg ${currentTheme.chatBubble} hover:opacity-80`}>
              {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>
            <button onClick={clearChatHistory} className={`px-4 py-2 rounded-lg ${currentTheme.chatBubble} hover:opacity-80`}>
              Clear Chat
            </button>
            <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: "#7E60BF" }}>
              Back to Home
            </button>
          </div>
        </header>

        <div ref={chatContainerRef} className={`flex-1 overflow-y-auto mb-4 rounded-lg shadow-lg p-4 hide-scrollbar ${currentTheme.chatBubble}`}>
          {chatHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="rounded-xl p-8 max-w-2xl" style={{ backgroundColor: theme === "light" ? "#F5EFFF" : "#2D3748" }}>
                <h2 className="text-2xl font-bold" style={{ color: "#7E60BF", background: "bg-[#F5EFFF]" }}>
                  Welcome to Doctor AI! 👩‍⚕️
                </h2>
                <p className="mt-4 text-sm">Type your health-related questions below, and I'll assist you with expert advice.</p>
              </div>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={index} className={`flex items-start mb-4 ${chat.type === "user" ? "justify-end" : ""}`}>
                <div
                  className={`inline-block max-w-[80%] p-3 rounded-lg shadow-md ${
                    chat.type === "user"
                      ? "bg-[#7E60BF] text-white rounded-br-none"
                      : currentTheme.chatBubble + " rounded-bl-none"
                  }`}
                >
                  <ReactMarkdown>{chat.content}</ReactMarkdown>
                  {chat.type === "ai" && (
                    <div className="mt-2">
                      <button onClick={() => copyToClipboard(chat.content)} className="text-xs text-blue-500 hover:underline">
                        📋 Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {generatingAnswer && (
            <div className="flex items-start">
              <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">Thinking...</div>
            </div>
          )}
        </div>

        <form onSubmit={generateAnswer} className="rounded-lg shadow-lg p-4">
          <div className="flex gap-2">
            <textarea
              required
              className={`flex-1 rounded p-3 focus:ring-2 resize-none border-2 border-[#7E60BF]  ${currentTheme.input}`}
              style={{ borderColor: theme === "light" ? "#7E60BF" : "#7E60BF" }}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything..."
              rows="2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generateAnswer(e);
                }
              }}
            ></textarea>
            <button type="submit" className={`px-6 py-2 rounded-md ${generatingAnswer ? "opacity-50 cursor-not-allowed" : ""}`} style={{ backgroundColor: "#7E60BF", color: "#ffffff" }} disabled={generatingAnswer}>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskAI;
