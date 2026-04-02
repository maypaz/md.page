import { useCurrentFrame, interpolate, Easing } from "remotion";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE_OUT = Easing.out(Easing.ease);

interface Line {
  text: string;
  color?: string;
  dim?: boolean;
  bold?: boolean;
  prefix?: "tool";
}

const RESPONSE_LINES: Line[] = [
  { text: "Read src/index.ts", prefix: "tool", dim: true },
  { text: "Read src/utils.ts", prefix: "tool", dim: true },
  { text: "Grep \"rateKey\" in src/", prefix: "tool", dim: true },
  { text: "" },
  { text: "# Root Cause Analysis: Rate Limiting Bug", color: "#cdd6f4", bold: true },
  { text: "" },
  { text: "The issue is in `src/index.ts:154`. The rate limit counter", color: "#bac2de" },
  { text: "**never resets properly** because the KV key uses the raw", color: "#bac2de" },
  { text: "IP without normalization.", color: "#bac2de" },
  { text: "" },
  { text: "## The Bug", color: "#cdd6f4", bold: true },
  { text: "" },
  { text: "```typescript", color: "#6c7086" },
  { text: "const ip = request.headers.get(\"CF-Connecting-IP\");", color: "#a6e3a1" },
  { text: "const rateKey = `rate:${ip}`;", color: "#a6e3a1" },
  { text: "```", color: "#6c7086" },
  { text: "" },
  { text: "## Impact", color: "#cdd6f4", bold: true },
  { text: "" },
  { text: "| Scenario       | Expected | Actual      |", color: "#bac2de" },
  { text: "|----------------|----------|-------------|", color: "#585b70" },
  { text: "| IPv4 clients   | 60/hr    | 60/hr ✅    |", color: "#bac2de" },
  { text: "| IPv6 clients   | 60/hr    | 5-15/hr ❌  |", color: "#bac2de" },
  { text: "| Behind proxy   | 60/hr    | Shared ⚠️    |", color: "#bac2de" },
  { text: "" },
  { text: "Affects **~34%** of users (those on IPv6 networks).", color: "#a6adc8" },
];

const LINE_DELAY = 2;
const FIRST_RESPONSE_START = 15;

interface TerminalSceneProps {
  showSecondPrompt: boolean;
  secondPromptChars: number;
  secondPromptText: string;
  showPublishing: boolean;
  showUrl: boolean;
  urlGlow: number;
  scrollOffset: number; // pixels to scroll up
}

export const TerminalScene: React.FC<TerminalSceneProps> = ({
  showSecondPrompt,
  secondPromptChars,
  secondPromptText,
  showPublishing,
  showUrl,
  urlGlow,
  scrollOffset,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width: "88%",
        height: "82%",
        background: "#1e1e2e",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        border: "1px solid #313244",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* macOS window chrome */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          gap: 6,
          borderBottom: "1px solid #313244",
          flexShrink: 0,
        }}
      >
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f38ba8" }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f9e2af" }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#a6e3a1" }} />
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 12,
            color: "#6c7086",
            fontFamily: "-apple-system, sans-serif",
          }}
        >
          claude — my-project
        </div>
      </div>

      {/* Scrollable content area */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "14px 24px",
            fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
            fontSize: 12.5,
            lineHeight: 1.65,
            transform: `translateY(-${scrollOffset}px)`,
          }}
        >
          {/* First user prompt */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 12,
              fontSize: 13,
            }}
          >
            <span style={{ color: "#89b4fa", fontWeight: 700 }}>{">"}</span>
            <span style={{ color: "#cdd6f4" }}>
              what is the root cause of the rate limiting bug? users report getting 429s after just 5 requests
            </span>
          </div>

          {/* Claude's response */}
          {RESPONSE_LINES.map((line, i) => {
            const appearFrame = FIRST_RESPONSE_START + i * LINE_DELAY;
            const opacity = interpolate(
              frame,
              [appearFrame, appearFrame + 3],
              [0, 1],
              { ...CLAMP, easing: EASE_OUT },
            );
            const translateY = interpolate(
              frame,
              [appearFrame, appearFrame + 3],
              [3, 0],
              { ...CLAMP, easing: EASE_OUT },
            );

            if (line.text === "") {
              return <div key={i} style={{ height: 6, opacity }} />;
            }

            if (line.prefix === "tool") {
              return (
                <div
                  key={i}
                  style={{
                    opacity,
                    transform: `translateY(${translateY}px)`,
                    color: "#6c7086",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 1,
                  }}
                >
                  <span style={{ color: "#89b4fa" }}>⏺</span>
                  <span>{line.text}</span>
                </div>
              );
            }

            return (
              <div
                key={i}
                style={{
                  opacity,
                  transform: `translateY(${translateY}px)`,
                  color: line.dim ? "#6c7086" : line.color || "#cdd6f4",
                  fontWeight: line.bold ? 600 : 400,
                  whiteSpace: "pre",
                }}
              >
                {line.text}
              </div>
            );
          })}

          {/* Second user prompt + response */}
          {showSecondPrompt && (
            <div style={{ marginTop: 16, borderTop: "1px solid #313244", paddingTop: 12 }}>
              <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                <span style={{ color: "#89b4fa", fontWeight: 700 }}>{">"}</span>
                <span style={{ color: "#cdd6f4" }}>
                  {secondPromptText.slice(0, secondPromptChars)}
                  {secondPromptChars < secondPromptText.length && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 15,
                        background: "#cdd6f4",
                        marginLeft: 1,
                        verticalAlign: "text-bottom",
                      }}
                    />
                  )}
                </span>
              </div>

              {showPublishing && (
                <div
                  style={{
                    marginTop: 10,
                    color: "#6c7086",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ color: "#89b4fa" }}>⏺</span>
                  <span>Publishing to md.page…</span>
                </div>
              )}

              {showUrl && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ color: "#bac2de", fontSize: 12.5, marginBottom: 4 }}>
                    Published! Here's your shareable link:
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      position: "relative",
                    }}
                    data-url-link
                  >
                    <span
                      style={{
                        color: "#89dceb",
                        fontSize: 14,
                        fontWeight: 600,
                        textShadow: `0 0 ${urlGlow}px rgba(137, 220, 235, 0.6)`,
                        textDecoration: "underline",
                        textDecorationColor: "rgba(137, 220, 235, 0.4)",
                        textUnderlineOffset: 3,
                      }}
                    >
                      https://md.page/a8Xk2m
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div
        style={{
          padding: "6px 24px",
          borderTop: "1px solid #313244",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#45475a",
          fontFamily: "-apple-system, sans-serif",
          flexShrink: 0,
        }}
      >
        <span>claude-opus-4-6</span>
        <span>
          <span style={{ color: "#6c7086" }}>38%</span> context
        </span>
      </div>
    </div>
  );
};
