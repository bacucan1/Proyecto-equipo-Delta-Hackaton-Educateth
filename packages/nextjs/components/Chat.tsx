import React, { useState } from "react";
import axios from "axios";

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
  const [isWaiting, setIsWaiting] = useState<boolean>(false); // Estado para bloquear input mientras se espera respuesta

  const sendMessage = async () => {
    if (!message || isWaiting) return; // Evita enviar mensajes si ya estás esperando

    setIsWaiting(true); // Bloquea la entrada
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
      setIsWaiting(false); // Libera la entrada
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
        placeholder="Type a message"
        className="border p-2 w-full"
        disabled={isWaiting} // Desactiva el input si se está esperando respuesta
      />
      <button
        onClick={sendMessage}
        className={`p-2 mt-2 ${
          isWaiting ? "bg-gray-400" : "bg-blue-500 text-white"
        }`}
        disabled={isWaiting} // Desactiva el botón si se está esperando respuesta
      >
        {isWaiting ? "Sending..." : "Send"}
      </button>
    </div>
  );
};

export default Chat;
