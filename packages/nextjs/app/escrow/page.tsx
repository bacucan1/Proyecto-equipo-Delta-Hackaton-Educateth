// Escrow.tsx
"use client";

// Agregar esta línea
import React from "react";

// Escrow.tsx

// Escrow.tsx

// Escrow.tsx

// Escrow.tsx

// Escrow.tsx

// Escrow.tsx

// Escrow.tsx

// Escrow.tsx

// Escrow.tsx

// Escrow.tsx

const Escrow: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Escrow Section</h1>
      <p style={{ marginTop: "10px" }}>Welcome to the Escrow section! Here, you can manage your secure transactions.</p>
      <ul style={{ marginTop: "20px", listStyleType: "disc", paddingLeft: "20px" }}>
        <li>Review pending agreements</li>
        <li>Track payment progress</li>
        <li>Resolve disputes with ease</li>
      </ul>
      <button
        style={{
          marginTop: "20px",
          padding: "10px 15px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() => (window.location.href = "/")} // Regresa al chat
      >
        Go Back
      </button>
    </div>
  );
};

export default Escrow;
