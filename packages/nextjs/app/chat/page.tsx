"use client";

import Chat from "~~/components/Chat";

const ChatPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-gray-800 dark:via-gray-900 dark:to-black p-6">
      {/* Header Section */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800 dark:text-gray-100">Chat Assistant</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Start chatting with our assistant to find the best quality products and secure your transactions with escrow.
        </p>
      </header>

      {/* Chat Section */}
      <main className="w-full max-w-4xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <Chat />
      </main>

      {/* Footer Section */}
      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Powered by <span className="font-bold">Team Delta</span>. Your safety is our priority.
      </footer>
    </div>
  );
};

export default ChatPage;
