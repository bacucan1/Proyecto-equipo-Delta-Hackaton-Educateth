"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const escrowABI = [
  "function createAndDeposit(address _payee, uint256 _deadline) external payable returns (uint256)",
  "function markAsDelivered(uint256 escrowId) external",
  "function initiateDispute(uint256 escrowId) external",
];

const contractAddress = "0xYourContractAddressHere";

const Escrow: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [payee] = useState<string>("0x172104Dec113769a5E9a6E00A99e037a42B2778C");
  const [amount] = useState<string>("0.022");
  const [deadline] = useState<string>((Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60).toString());
  const [escrowId, setEscrowId] = useState<string>("");
  const [showActions, setShowActions] = useState<boolean>(false);
  const [productInfo] = useState({
    description: "Auriculares inalámbricos con cancelación de ruido, hasta 20 horas de batería y carga rápida.",
    seller: "AudioTech",
    rating: "4.7/5",
  });

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  const createAndDeposit = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, escrowABI, signer);

      const tx = await contract.createAndDeposit(payee, deadline, {
        value: ethers.utils.parseEther(amount),
      });
      const receipt = await tx.wait();

      alert("Escrow created successfully!");
      setEscrowId(receipt.logs[0]?.data || "");
      setShowActions(true);
    } catch (error) {
      console.error("Error creating escrow:", error);
    }
  };

  const markAsDelivered = async () => {
    if (!escrowId) {
      alert("Please provide the escrow ID.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, escrowABI, signer);

      const tx = await contract.markAsDelivered(escrowId);
      await tx.wait();

      alert("Marked as delivered successfully!");
    } catch (error) {
      console.error("Error marking as delivered:", error);
    }
  };

  const initiateDispute = async () => {
    if (!escrowId) {
      alert("Please provide the escrow ID.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, escrowABI, signer);

      const tx = await contract.initiateDispute(escrowId);
      await tx.wait();

      alert("Dispute initiated successfully!");
    } catch (error) {
      console.error("Error initiating dispute:", error);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        }
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-10">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center">Escrow Assistant</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Secure your transactions with our escrow system.
        </p>

        {/* Información del Producto */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Product Information</h2>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Description:</strong> {productInfo.description}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Seller:</strong> {productInfo.seller}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Rating:</strong> {productInfo.rating}
          </p>
        </div>

        {/* Conexión de la Wallet */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Wallet Connection</h2>
          {isWalletConnected ? (
            <p className="text-green-600 dark:text-green-400">Wallet connected: {walletAddress}</p>
          ) : (
            <button
              onClick={connectWallet}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Detalles del Escrow */}
        {isWalletConnected && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Escrow Details</h2>
            <input
              type="text"
              value={payee}
              readOnly
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mb-2 p-2 rounded-lg"
            />
            <input
              type="text"
              value={amount}
              readOnly
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mb-2 p-2 rounded-lg"
            />
            <input
              type="text"
              value={deadline}
              readOnly
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mb-4 p-2 rounded-lg"
            />
            {!showActions ? (
              <button
                onClick={createAndDeposit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Create & Deposit
              </button>
            ) : (
              <div className="flex flex-col gap-4">
                <button
                  onClick={markAsDelivered}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Mark Delivered
                </button>
                <button
                  onClick={initiateDispute}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Initiate Dispute
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Escrow;
