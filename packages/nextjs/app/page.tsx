"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ChatBubbleLeftRightIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="flex flex-col items-center flex-grow min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <header className="px-5 py-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-blue-700 dark:text-blue-300">
          Welcome to <span className="text-blue-900 dark:text-blue-500">SmartAsist</span>
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Discover the best online deals with our AI-powered assistant, ensuring secure purchases through a reliable
          escrow system.
        </p>
      </header>

      <div className="flex flex-col items-center mt-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center space-y-5">
          <h4 className="font-medium text-gray-600 dark:text-gray-400">Connected Address:</h4>
          <Address address={connectedAddress} />
        </div>

        <p className="text-lg text-center mt-6 text-gray-700 dark:text-gray-300">
          Start chatting with our assistant or debug your smart contract:
        </p>

        <div className="flex flex-wrap justify-center items-center gap-6 mt-6">
          <Link href="/chat" passHref>
            <button className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium text-lg rounded-lg shadow-md transition">
              <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2" />
              Chat with Assistant
            </button>
          </Link>
          <Link href="/debug" passHref>
            <button className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium text-lg rounded-lg shadow-md transition">
              <ShieldCheckIcon className="h-6 w-6 mr-2" />
              Debug Contracts
            </button>
          </Link>
        </div>
      </div>

      <section className="bg-blue-50 dark:bg-gray-800 mt-16 px-8 py-12 w-full">
        <div className="max-w-3xl bg-white dark:bg-gray-700 mx-auto rounded-3xl p-10 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-300 mb-6">
            Why Choose SmartAsist?
          </h2>
          <ul className="list-none space-y-6">
            <li className="flex items-start space-x-3">
              <span className="text-blue-600 dark:text-blue-400 text-xl">🔍</span>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                <strong>Find Quality Products:</strong> Get AI-curated recommendations for high-quality purchases.
              </p>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-green-600 dark:text-green-400 text-xl">🔒</span>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                <strong>Secure Transactions:</strong> Every purchase is protected through our escrow system.
              </p>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-purple-600 dark:text-purple-400 text-xl">💬</span>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                <strong>Easy Interaction:</strong> Chat with the assistant anytime to explore deals and secure
                transactions.
              </p>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Home;
