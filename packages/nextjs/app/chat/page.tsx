"use client";

import Chat from "~~/components/Chat";

const ChatPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-300 p-6">
      <h1 className="text-4xl font-bold mb-6">Chat Assistant</h1>
      <p className="text-lg text-center mb-4">
        Start chatting with our assistant to find the best quality products and secure your transactions with escrow.
      </p>
      <div className="w-full max-w-3xl bg-base-100 p-6 rounded-lg shadow-md">
        <Chat />
      </div>
    </div>
  );
};

export default ChatPage;
