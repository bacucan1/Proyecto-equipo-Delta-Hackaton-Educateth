"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const EscrowPage: React.FC = () => {
  const { address: connectedWallet } = useAccount(); // Wallet conectada
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState(40); // USD
  const [deadline, setDeadline] = useState(BigInt(Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60)); // 10 días
  const ethPriceInUSD = 4200; // Precio fijo de ETH en USD
  const amountETH = (amount / ethPriceInUSD).toFixed(6); // Conversión de USD a ETH
  const [escrows, setEscrows] = useState<any[]>([]); // Lista de escrows detallados

  const { data: userEscrows } = useScaffoldReadContract({
    contractName: "Escrowdelta",
    functionName: "getEscrowsByAddress",
    args: [connectedWallet],
  });

  useEffect(() => {
    const loadEscrows = async () => {
      if (userEscrows) {
        const [payerEscrows, payeeEscrows] = userEscrows;
        const combinedEscrows = [
          ...payerEscrows.map((id: bigint) => ({ id, role: "buyer" })),
          ...payeeEscrows.map((id: bigint) => ({ id, role: "seller" })),
        ];
        setEscrows(combinedEscrows);
      }
    };

    loadEscrows();
  }, [userEscrows]);

  const { writeContractAsync: createAndDeposit, isPending: isCreating } = useScaffoldWriteContract("Escrowdelta");

  const handleCreateEscrow = async () => {
    setUserMessage(null);
    try {
      await createAndDeposit({
        functionName: "createAndDeposit",
        args: [payee, BigInt(deadline)],
        value: BigInt(Math.floor(parseFloat(amountETH) * 10 ** 18)),
      });
      setUserMessage("✅ Escrow creado con éxito.");
    } catch (error) {
      setUserMessage(`❌ Error al crear escrow: ${(error as Error).message}`);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8 dark:bg-gray-900 dark:text-white bg-gray-100 text-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Gestión de Escrows</h1>

      {/* Formulario para crear un nuevo escrow */}
      <div className="bg-white dark:bg-gray-800 dark:text-gray-300 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Crear Escrow</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Payee Address</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
            value={payee}
            onChange={e => setPayee(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Amount (in USD)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
          <p className="text-sm text-gray-400">Equivalent in ETH: {amountETH} ETH</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Deadline (Unix Timestamp)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
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

      {/* Tabla de escrows */}
      <div className="bg-white dark:bg-gray-800 dark:text-gray-300 p-6 rounded-lg pb-8">
        <h2 className="text-2xl font-bold mb-4">Tus Escrows</h2>
        {escrows.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-600">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border border-gray-600 px-4 py-2 text-left">ID</th>
                <th className="border border-gray-600 px-4 py-2 text-left">Role</th>
                <th className="border border-gray-600 px-4 py-2 text-left">State</th>
                <th className="border border-gray-600 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {escrows.map(escrow => (
                <tr
                  key={escrow.id.toString()}
                  className={`${
                    escrow.role === "buyer" ? "bg-blue-50 dark:bg-blue-900" : "bg-green-50 dark:bg-green-900"
                  } hover:bg-gray-200 dark:hover:bg-gray-700`}
                >
                  <td className="border border-gray-600 px-4 py-2">{escrow.id.toString()}</td>
                  <td className="border border-gray-600 px-4 py-2">{escrow.role === "buyer" ? "Buyer" : "Seller"}</td>
                  <td className="border border-gray-600 px-4 py-2">{escrow.currentState || "Unknown"}</td>
                  <td className="border border-gray-600 px-4 py-2">
                    <div className="flex flex-wrap gap-2">{/* Acciones según el rol */}</div>
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
