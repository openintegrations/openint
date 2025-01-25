import type React from "react";

interface SpinnerProps {
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ color = "#000000" }) => {
  return (
    <div
      className="spinner"
      style={{
        border: "4px solid rgba(0, 0, 0, 0.1)",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        borderTop: `4px solid ${color}`,
        animation: "spin 1s linear infinite",
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
