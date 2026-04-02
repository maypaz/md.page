import React from "react";

interface IPhoneFrameProps {
  children: React.ReactNode;
}

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({ children }) => {
  return (
    <div
      style={{
        width: 340,
        height: 680,
        background: "#000",
        borderRadius: 50,
        padding: 12,
        boxShadow:
          "0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
        position: "relative",
      }}
    >
      {/* Inner screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 40,
          overflow: "hidden",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 34,
            background: "#000",
            borderRadius: 20,
            zIndex: 10,
          }}
        />

        {/* Status bar */}
        <div
          style={{
            height: 54,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "0 28px 6px",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "-apple-system, 'SF Pro Text', sans-serif",
            color: "#000",
            flexShrink: 0,
            background: "#fff",
          }}
        >
          <span>15:35</span>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <svg width="16" height="12" viewBox="0 0 16 12">
              <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#000" />
              <rect x="4" y="5" width="3" height="7" rx="0.5" fill="#000" />
              <rect x="8" y="2" width="3" height="10" rx="0.5" fill="#000" />
              <rect x="12" y="0" width="3" height="12" rx="0.5" fill="#000" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
              <path d="M7.5 9a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" fill="#000" />
              <path d="M4 7.5c1-1.2 2.1-1.8 3.5-1.8s2.5.6 3.5 1.8" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M1.5 4.5C3 2.8 5 1.8 7.5 1.8s4.5 1 6 2.7" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12">
              <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="#000" strokeWidth="1" fill="none" />
              <rect x="2" y="3" width="14" height="6" rx="1" fill="#000" />
              <rect x="22" y="3.5" width="2" height="5" rx="1" fill="#000" opacity="0.4" />
            </svg>
          </span>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
