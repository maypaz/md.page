import React from "react";
import { Img, staticFile, useCurrentFrame, interpolate, Easing } from "remotion";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE_OUT = Easing.out(Easing.ease);

const RECIPE_LINES: string[] = [
  "# Classic Carbonara",
  "",
  "A simple Roman classic — *ready in 20 min.*",
  "",
  "| Ingredient | Amount |",
  "|---|---|",
  "| Spaghetti | 400g |",
  "| Guanciale | 200g |",
  "| Egg yolks | 4 |",
  "| Pecorino | 100g |",
  "",
  "## Steps",
  "1. Boil pasta in **salted** water",
  "2. Crisp guanciale (no oil needed)",
  "3. Whisk eggs, cheese & pepper",
  "4. Toss hot pasta off heat",
  "5. Add egg mixture, toss quickly",
  "",
  "```",
  "sauce = eggs + cheese + pasta water",
  "```",
  "",
  "> **Tip:** Never add cream. The sauce",
  "> comes from eggs and pasta water.",
  "",
  "---",
  "**Serves 4** · 450 kcal/serving",
];

const MESSAGE_APPEAR = [5, 25]; // frames when each message appears
const RECIPE_LINE_DELAY = 1.5;

interface TelegramChatProps {
  showSecondPrompt: boolean; // bubble sent
  secondPromptText: string;
  inputFieldText: string; // text currently in the input field (typing phase)
  showTyping: boolean;
  showBotReply: boolean;
  linkUrl: string;
  scrollOffset: number;
}

// User bubble — right aligned, Telegram green-blue
const UserBubble: React.FC<{
  text: string;
  time: string;
  opacity: number;
  translateY: number;
}> = ({ text, time, opacity, translateY }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: 4,
      paddingRight: 8,
      paddingLeft: 40,
      opacity,
      transform: `translateY(${translateY}px)`,
    }}
  >
    <div
      style={{
        background: "#e1fec6",
        color: "#000",
        padding: "6px 10px 4px",
        borderRadius: "12px 12px 2px 12px",
        fontSize: 14,
        lineHeight: 1.35,
        fontFamily: "-apple-system, 'SF Pro Text', sans-serif",
        position: "relative",
        boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
      }}
    >
      {text}
      <span
        style={{
          fontSize: 10,
          color: "#5db25b",
          marginLeft: 8,
          float: "right",
          marginTop: 4,
        }}
      >
        {time}
      </span>
    </div>
  </div>
);

// Bot bubble — left aligned, white
const BotBubble: React.FC<{
  children: React.ReactNode;
  time: string;
  opacity: number;
}> = ({ children, time, opacity }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-start",
      marginBottom: 4,
      paddingLeft: 8,
      paddingRight: 40,
      opacity,
    }}
  >
    <div
      style={{
        background: "#fff",
        color: "#000",
        padding: "6px 10px 4px",
        borderRadius: "12px 12px 12px 2px",
        fontSize: 14,
        lineHeight: 1.35,
        fontFamily: "-apple-system, 'SF Pro Text', sans-serif",
        position: "relative",
        boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
        maxWidth: "88%",
      }}
    >
      {children}
      <span
        style={{
          fontSize: 10,
          color: "#aaa",
          marginLeft: 8,
          float: "right",
          marginTop: 2,
        }}
      >
        {time}
      </span>
    </div>
  </div>
);

const TypingIndicator: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: 4,
        paddingLeft: 8,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "10px 14px",
          borderRadius: "12px 12px 12px 2px",
          display: "flex",
          gap: 3,
          boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#aaa",
              opacity: interpolate(
                (frame + i * 5) % 20,
                [0, 10, 20],
                [0.3, 1, 0.3],
                CLAMP,
              ),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const TelegramChat: React.FC<TelegramChatProps> = ({
  showSecondPrompt,
  secondPromptText,
  inputFieldText,
  showTyping,
  showBotReply,
  linkUrl,
  scrollOffset,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: "#b5d8c4",
      }}
    >
      {/* Telegram header */}
      <div
        style={{
          background: "#fff",
          padding: "6px 10px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          borderBottom: "0.5px solid rgba(0,0,0,0.08)",
        }}
      >
        {/* Back arrow */}
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
          <path
            d="M10 2L2 10L10 18"
            stroke="#3390ec"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Center: name + bot label */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: "#000",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "-apple-system, 'SF Pro Text', sans-serif",
            }}
          >
            OpenClaw
          </div>
          <div
            style={{
              color: "#999",
              fontSize: 11,
              fontFamily: "-apple-system, 'SF Pro Text', sans-serif",
            }}
          >
            bot
          </div>
        </div>

        {/* Avatar — OpenClaw crab */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Img
            src={staticFile("openclaw.svg")}
            style={{ width: 32, height: 32 }}
          />
        </div>
      </div>

      {/* Chat area with wallpaper background */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
          // Telegram-style subtle wallpaper tint
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            padding: "10px 4px",
            transform: `translateY(-${scrollOffset}px)`,
          }}
        >
          {/* First user message */}
          {(() => {
            const appear = MESSAGE_APPEAR[0];
            const opacity = interpolate(frame, [appear, appear + 4], [0, 1], CLAMP);
            const ty = interpolate(frame, [appear, appear + 4], [8, 0], {
              ...CLAMP,
              easing: EASE_OUT,
            });
            return (
              <UserBubble
                text="What's a good pasta recipe for tonight?"
                time="15:32"
                opacity={opacity}
                translateY={ty}
              />
            );
          })()}

          {/* Bot recipe response */}
          {(() => {
            const appear = MESSAGE_APPEAR[1];
            const opacity = interpolate(frame, [appear, appear + 4], [0, 1], CLAMP);
            return (
              <BotBubble time="15:33" opacity={opacity}>
                {RECIPE_LINES.map((line, i) => {
                  const lineFrame = appear + 3 + i * RECIPE_LINE_DELAY;
                  const lineOpacity = interpolate(
                    frame,
                    [lineFrame, lineFrame + 2],
                    [0, 1],
                    CLAMP,
                  );

                  if (line === "") {
                    return (
                      <div key={i} style={{ height: 4, opacity: lineOpacity }} />
                    );
                  }

                  return (
                    <div
                      key={i}
                      style={{
                        opacity: lineOpacity,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontSize: 13.5,
                        lineHeight: 1.4,
                        color: "#000",
                      }}
                    >
                      {line}
                    </div>
                  );
                })}
              </BotBubble>
            );
          })()}

          {/* Second user prompt — appears as full bubble after "send" */}
          {showSecondPrompt && (
            <UserBubble
              text={secondPromptText}
              time="15:34"
              opacity={1}
              translateY={0}
            />
          )}

          {/* Typing indicator */}
          {showTyping && <TypingIndicator />}

          {/* Bot reply with link */}
          {showBotReply && (
            <BotBubble time="15:34" opacity={1}>
              <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>
                Here's your page:
              </div>
              <div
                style={{
                  color: "#3390ec",
                  fontSize: 13.5,
                  marginTop: 3,
                }}
                data-link
              >
                {linkUrl}
              </div>
            </BotBubble>
          )}
        </div>
      </div>

      {/* Input bar — Telegram iOS style */}
      <div
        style={{
          background: "#fff",
          padding: "6px 8px 8px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          borderTop: "0.5px solid rgba(0,0,0,0.08)",
          flexShrink: 0,
        }}
      >
        {/* Menu button */}
        <div
          style={{
            background: "#3390ec",
            borderRadius: 18,
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 5,
            flexShrink: 0,
          }}
        >
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <line x1="1" y1="1" x2="13" y2="1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="1" y1="5" x2="13" y2="5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="1" y1="9" x2="13" y2="9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span
            style={{
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "-apple-system, sans-serif",
            }}
          >
            Menu
          </span>
        </div>

        {/* Attachment */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15.5 6v9.5a3.5 3.5 0 11-7 0V5a2 2 0 114 0v9.5a.5.5 0 11-1 0V6"
            stroke="#3390ec"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Message input */}
        <div
          style={{
            flex: 1,
            background: "#f0f0f0",
            borderRadius: 18,
            padding: "7px 14px",
            fontSize: 14,
            color: "#999",
            fontFamily: "-apple-system, 'SF Pro Text', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: inputFieldText ? "#000" : "#999" }}>
            {inputFieldText || "Message"}
          </span>
          {/* Emoji icon inside input */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="#999" strokeWidth="1.2" />
            <circle cx="7.5" cy="8.5" r="1" fill="#999" />
            <circle cx="12.5" cy="8.5" r="1" fill="#999" />
            <path d="M7 12.5c.8 1.2 2 1.8 3 1.8s2.2-.6 3-1.8" stroke="#999" strokeWidth="1" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Mic */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="3" width="6" height="11" rx="3" stroke="#3390ec" strokeWidth="1.5" fill="none" />
          <path d="M6 12c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="#3390ec" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <line x1="12" y1="18" x2="12" y2="21" stroke="#3390ec" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};
