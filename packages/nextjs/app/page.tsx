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
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 text-center">
        <h1>
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">SmartAsist</span>
        </h1>
        <p className="text-lg mt-4">
          Discover the best online deals with our AI-powered chat assistant, designed to ensure secure and quality
          purchases using a reliable escrow system.
        </p>

        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mt-4">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address address={connectedAddress} />
        </div>

        <p className="text-center text-lg mt-4">
          Get started by chatting with our assistant or checking your smart contract:
        </p>

        <div className="flex justify-center items-center gap-12 flex-col sm:flex-row mt-6">
          <Link href="/chat" passHref className="btn btn-primary">
            <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2" />
            Chat with Assistant
          </Link>
          <Link href="/debug" passHref className="btn btn-secondary">
            <ShieldCheckIcon className="h-6 w-6 mr-2" />
            Debug Contracts
          </Link>
        </div>
      </div>

      <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
        <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-2xl rounded-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Why Choose SmartAsist?</h2>
          <ul className="list-disc list-inside text-left space-y-2">
            <li>🔍 **Find Quality Products**: Get AI-curated recommendations for high-quality purchases.</li>
            <li>🔒 **Secure Transactions**: Every purchase is protected through our escrow system.</li>
            <li>💬 **Easy Interaction**: Chat with the assistant anytime to explore deals and secure transactions.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
