import React, { useState } from "react";
import axios from "axios";

// Define the expected shape of the response
interface LLMResponse {
  response: string;
}

interface Message {
  user: string;
  text: string;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  const sendMessage = async () => {
    if (!message) return;

    try {
      // Declare the expected response type
      const response = await axios.post<LLMResponse>("http://192.168.1.7:5000/chat", {
        prompt: message,
      });

      const llmResponse = response.data.response || "No response from LLM";

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
    }
  };

  return (
    <div>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        {chatHistory.map((chat, index) => (
          <p key={index}>
            <strong>{chat.user}:</strong> {chat.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        className="border p-2 w-full"
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white p-2 mt-2">
        Send
      </button>
    </div>
  );
};

export default Chat;
