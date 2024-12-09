"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const EscrowPage: React.FC = () => {
  const { address: connectedWallet } = useAccount();
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState(40); // USD
  const [deadline, setDeadline] = useState(BigInt(Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60));
  const ethPriceInUSD = 4200; // Precio fijo de ETH en USD
  const amountETH = (amount / ethPriceInUSD).toFixed(6); // Conversión de USD a ETH
  const [escrows, setEscrows] = useState<any[]>([]);

  // Leer escrows asociados a la wallet conectada
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

  // Crear un nuevo escrow
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

  // Marcar como entregado
  const { writeContractAsync: markAsDelivered } = useScaffoldWriteContract("Escrowdelta");

  const handleMarkAsDelivered = async (escrowId: bigint) => {
    try {
      await markAsDelivered({
        functionName: "markAsDelivered",
        args: [escrowId],
      });
      setUserMessage(`✅ Pedido #${escrowId} marcado como enviado.`);
    } catch (error) {
      setUserMessage(`❌ Error al marcar como enviado: ${(error as Error).message}`);
    }
  };

  // Confirmar transacción
  const { writeContractAsync: handleDeadline } = useScaffoldWriteContract("Escrowdelta");

  const handleConfirm = async (escrowId: bigint) => {
    setUserMessage(null);
    try {
      await handleDeadline({
        functionName: "handleDeadline",
        args: [escrowId],
      });
      setUserMessage(`✅ Escrow #${escrowId} confirmado con éxito.`);
    } catch (error) {
      setUserMessage(`❌ Error al confirmar escrow #${escrowId}: ${(error as Error).message}`);
    }
  };

  // Iniciar disputa
  const { writeContractAsync: initiateDispute } = useScaffoldWriteContract("Escrowdelta");

  const handleInitiateDispute = async (escrowId: bigint) => {
    setUserMessage(null);
    try {
      await initiateDispute({
        functionName: "initiateDispute",
        args: [escrowId],
      });
      setUserMessage(`✅ Disputa iniciada para el escrow #${escrowId}.`);
    } catch (error) {
      setUserMessage(`❌ Error al iniciar disputa para el escrow #${escrowId}: ${(error as Error).message}`);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8 dark:bg-gray-900 dark:text-gray-100 bg-white text-gray-900">
      <h1 className="text-3xl font-bold mb-6">Gestión de Escrows</h1>

      {/* Formulario para crear un nuevo escrow */}
      <div className="bg-gray-200 dark:bg-gray-800 dark:text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Crear Escrow</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Payee Address</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            value={payee}
            onChange={e => setPayee(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Amount (in USD)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
          <p className="text-sm text-gray-400">Equivalent in ETH: {amountETH} ETH</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Deadline (Unix Timestamp)</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
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
      <div className="bg-gray-200 dark:bg-gray-800 dark:text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Tus Escrows</h2>
        {escrows.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-600">
            <thead>
              <tr className="bg-gray-300 dark:bg-gray-700">
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
                  className={`${escrow.role === "buyer" ? "bg-blue-900" : "bg-green-900"} hover:bg-gray-700 text-white`}
                >
                  <td className="border border-gray-600 px-4 py-2">{escrow.id.toString()}</td>
                  <td className="border border-gray-600 px-4 py-2">{escrow.role === "buyer" ? "Buyer" : "Seller"}</td>
                  <td className="border border-gray-600 px-4 py-2">{escrow.currentState || "Unknown"}</td>
                  <td className="border border-gray-600 px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      {/* Buyer: Confirmar */}
                      {escrow.role === "buyer" && (
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-all duration-200"
                          onClick={() => handleConfirm(escrow.id)}
                        >
                          Confirmar
                        </button>
                      )}

                      {/* Buyer: Iniciar disputa */}
                      {escrow.role === "buyer" && (
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-all duration-200"
                          onClick={() => handleInitiateDispute(escrow.id)}
                        >
                          Disputa
                        </button>
                      )}

                      {/* Seller: Marcar como Enviado */}
                      {escrow.role === "seller" && (
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-all duration-200"
                          onClick={() => handleMarkAsDelivered(escrow.id)}
                        >
                          Marcar Enviado
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm">No tienes escrows.</p>
        )}
      </div>
    </div>
  );
};

export default EscrowPage;
