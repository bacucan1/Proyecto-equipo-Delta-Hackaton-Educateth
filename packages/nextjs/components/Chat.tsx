import React, { useEffect, useRef, useState } from "react";
import Markdown from "markdown-to-jsx";

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

  useEffect(() => {
    const storedHistory = localStorage.getItem("chatHistory");
    if (storedHistory) {
      setChatHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message || isWaiting) return;

    setIsWaiting(true);
    try {
      const response = await fetch("https://29fc-186-86-110-141.ngrok-free.app/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nombre_del_modelo",
          messages: [
            ...chatHistory.map(chat => ({
              role: chat.user === "You" ? "user" : "assistant",
              content: chat.text,
            })),
            { role: "user", content: message },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LLMResponse = await response.json();
      const llmResponse = data.choices[0]?.message?.content || "No response from LLM";

      setChatHistory(prevHistory => [
        ...prevHistory,
        { user: "You", text: message },
        { user: "LLM", text: llmResponse },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory(prevHistory => [...prevHistory, { user: "Error", text: "Failed to get a response." }]);
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

  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem("chatHistory");
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md">
      <div
        ref={chatContainerRef}
        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-lg max-h-80 overflow-y-auto space-y-4"
      >
        {chatHistory.map((chat, index) => (
          <div key={index} className={`flex ${chat.user === "You" ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-lg ${
                chat.user === "You"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
              }`}
            >
              <strong>{chat.user}:</strong> <Markdown>{chat.text}</Markdown>
            </div>
          </div>
        ))}
        {isWaiting && <p className="italic text-gray-500 dark:text-gray-400">Waiting for response...</p>}
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isWaiting}
        />
        <button
          onClick={sendMessage}
          className={`px-4 py-2 rounded-lg shadow-sm text-white ${
            isWaiting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
          }`}
          disabled={isWaiting}
        >
          {isWaiting ? "Sending..." : "Send"}
        </button>
        <button
          onClick={clearHistory}
          className="px-4 py-2 rounded-lg shadow-sm bg-red-500 hover:bg-red-600 text-white focus:ring-2 focus:ring-red-300"
        >
          Clear
        </button>
      </div>
      <div className="mt-4">
        <button
          onClick={() => (window.location.href = "/escrow")}
          className="w-full px-8 py-4 rounded-lg shadow-sm bg-green-500 hover:bg-green-600 text-white focus:ring-2 focus:ring-green-300"
        >
          Escrow
        </button>
      </div>
    </div>
  );
};

export default Chat;
