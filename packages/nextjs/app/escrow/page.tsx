"use client";

import React, { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const EscrowPage: React.FC = () => {
  const [payee, setPayee] = useState("0x172104Dec113769a5E9a6E00A99e037a42B2778C");
  const [amount, setAmount] = useState(40); // USD
  const [deadline, setDeadline] = useState(
    BigInt(Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60), // 10 días
  );
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const ethPriceInUSD = 4200; // Precio fijo de ETH en USD
  const amountETH = (amount / ethPriceInUSD).toFixed(6); // Conversión de USD a ETH

  // Leer el contador de escrows creados
  const { data: escrowCount } = useScaffoldReadContract({
    contractName: "Escrowdelta",
    functionName: "escrowCount",
  });

  // Hook para crear y depositar un escrow
  const { writeContractAsync: createAndDeposit, isPending: isCreating } = useScaffoldWriteContract("Escrowdelta");

  const handleCreateEscrow = async () => {
    setUserMessage(null);
    try {
      await createAndDeposit({
        functionName: "createAndDeposit",
        args: [payee, BigInt(deadline)],
        value: BigInt(Math.floor(parseFloat(amountETH) * 10 ** 18)), // Cambio aquí
      });

      setUserMessage("✅ Escrow created successfully!");
    } catch (error) {
      setUserMessage(`❌ Error creating escrow: ${(error as Error).message}`);
    }
  };

  // Hook para marcar como entregado
  const { writeContractAsync: markAsDelivered } = useScaffoldWriteContract("Escrowdelta");

  const handleMarkAsDelivered = async (escrowId: bigint) => {
    try {
      await markAsDelivered({
        functionName: "markAsDelivered",
        args: [escrowId],
      });
      setUserMessage(`✅ Escrow #${escrowId} marked as delivered successfully!`);
    } catch (error) {
      setUserMessage(`❌ Error marking escrow #${escrowId} as delivered: ${(error as Error).message}`);
    }
  };

  // Hook para iniciar una disputa
  const { writeContractAsync: initiateDispute } = useScaffoldWriteContract("Escrowdelta");

  const handleInitiateDispute = async (escrowId: bigint) => {
    try {
      await initiateDispute({
        functionName: "initiateDispute",
        args: [escrowId],
      });
      setUserMessage(`✅ Dispute initiated for Escrow #${escrowId} successfully!`);
    } catch (error) {
      setUserMessage(`❌ Error initiating dispute for Escrow #${escrowId}: ${(error as Error).message}`);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Formulario para crear escrow */}
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Create Escrow</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Payee Address</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={payee}
            onChange={e => setPayee(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Amount (in USD)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
          <p className="text-sm text-gray-400">Equivalent in ETH: {amountETH} ETH</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Deadline (Unix Timestamp)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={String(deadline)}
            onChange={e => setDeadline(BigInt(e.target.value))}
          />
        </div>
        <button
          onClick={handleCreateEscrow}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          disabled={isCreating}
        >
          {isCreating ? "Processing..." : "Create & Deposit"}
        </button>
        {userMessage && <p className="text-sm mt-2">{userMessage}</p>}
      </div>

      {/* Listado de Escrows */}
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Your Escrows</h2>
        {escrowCount ? (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Payee</th>
                <th className="text-left p-2">Deadline</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Number(escrowCount) }, (_, idx) => (
                <tr key={idx}>
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">Dynamic Amount Here</td>
                  <td className="p-2">Dynamic Payee Here</td>
                  <td className="p-2">Dynamic Deadline Here</td>
                  <td className="p-2 flex space-x-2">
                    <button
                      onClick={() => handleMarkAsDelivered(BigInt(idx + 1))}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Delivered
                    </button>
                    <button
                      onClick={() => handleInitiateDispute(BigInt(idx + 1))}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Dispute
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No escrows found.</p>
        )}
      </div>
    </div>
  );
};

export default EscrowPage;
