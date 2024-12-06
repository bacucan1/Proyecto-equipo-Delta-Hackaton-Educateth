import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown"; // Para renderizar Markdown

// Define the expected shape of the response
interface LLMResponse {
  choices: { message: { role: string; content: string } }[];
}

interface Message {
  user: string;
  text: string;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!message || isWaiting) return;

    setIsWaiting(true);
    try {
      const response = await axios.post<LLMResponse>(
        "https://7afa-186-86-110-141.ngrok-free.app/v1/chat/completions",
        {
          model: "nombre_del_modelo", // Cambia a tu modelo disponible
          messages: [
            ...chatHistory.map((chat) => ({
              role: chat.user === "You" ? "user" : "assistant",
              content: chat.text,
            })),
            { role: "user", content: message },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const llmResponse =
        response.data.choices[0]?.message?.content || "No response from LLM";

      setChatHistory((prevHistory) => [
        ...prevHistory,
        { user: "You", text: message },
        { user: "LLM", text: llmResponse },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { user: "Error", text: "Failed to get a response." },
      ]);
    } finally {
      setIsWaiting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    // Desplaza automáticamente el chat hacia abajo al actualizarse
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div>
      <div
        ref={chatContainerRef}
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        {chatHistory.map((chat, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <strong>{chat.user}:</strong>
            <ReactMarkdown>{chat.text}</ReactMarkdown>
          </div>
        ))}
        {isWaiting && (
          <p>
            <em>Waiting for response...</em>
          </p>
        )}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown} // Captura la tecla Enter
        placeholder="Type a message"
        className="border p-2 w-full"
        disabled={isWaiting}
      />
      <button
        onClick={sendMessage}
        className={`p-2 mt-2 ${
          isWaiting ? "bg-gray-400" : "bg-blue-500 text-white"
        }`}
        disabled={isWaiting}
      >
        {isWaiting ? "Sending..." : "Send"}
      </button>
    </div>
  );
};

export default Chat;
