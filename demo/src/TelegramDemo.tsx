import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { IPhoneFrame } from "./IPhoneFrame";
import { TelegramChat } from "./TelegramChat";
import { BrowserScene } from "./BrowserScene";
import { EndCard } from "./EndCard";
import { AnimatedCursor } from "./Cursor";

// Timeline (frames at 30fps)
const INPUT_TYPING_START = 110; // user starts typing in input field
const INPUT_SEND = 145; // user hits send — bubble appears, input clears
const SCROLL_START = 145; // scroll up when bubble appears
const TYPING_START = 155; // bot typing indicator
const BOT_REPLY_START = 175;

const CURSOR_APPEAR = 185;
const CURSOR_CLICK = 198;
const CURSOR_DISAPPEAR = 208;

const TRANSITION_START = 208;
const BROWSER_START = 220;

const ENDCARD_START = 360;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PROMPT_TEXT = "create md.page I can share";
const LINK_URL = "https://md.page/D9GjKQ";

export const TelegramDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Scroll ---
  const scrollSpring = spring({
    frame: frame - SCROLL_START,
    fps,
    config: { damping: 30, stiffness: 40, mass: 1 },
  });
  const scrollOffset = interpolate(scrollSpring, [0, 1], [0, 280]);

  // --- Phone opacity ---
  const phoneOpacity = interpolate(
    frame,
    [TRANSITION_START, TRANSITION_START + 12],
    [1, 0],
    CLAMP,
  );

  const phoneScale = interpolate(
    frame,
    [TRANSITION_START, TRANSITION_START + 12],
    [1, 0.97],
    CLAMP,
  );

  // --- Input field typing (before send) ---
  const inputChars = Math.min(
    PROMPT_TEXT.length,
    Math.floor(
      interpolate(frame, [INPUT_TYPING_START, INPUT_SEND - 3], [0, PROMPT_TEXT.length], {
        ...CLAMP,
      }),
    ),
  );
  // Text in the input field: shows while typing, clears after send
  const inputFieldText = frame >= INPUT_TYPING_START && frame < INPUT_SEND
    ? PROMPT_TEXT.slice(0, inputChars)
    : "";

  // --- Browser ---
  const browserProgress = spring({
    frame: frame - BROWSER_START,
    fps,
    config: { damping: 24, stiffness: 100, mass: 0.8 },
  });

  const browserScale = interpolate(browserProgress, [0, 1], [0.92, 1]);
  const browserOpacity = interpolate(browserProgress, [0, 1], [0, 1]);

  const browserFadeOut = interpolate(
    frame,
    [ENDCARD_START - 10, ENDCARD_START + 5],
    [1, 0],
    CLAMP,
  );

  // --- End card ---
  const endCardOpacity = interpolate(
    frame,
    [ENDCARD_START, ENDCARD_START + 15],
    [0, 1],
    CLAMP,
  );

  return (
    <AbsoluteFill style={{ background: "#1a1a2e" }}>

      {/* Scene 1-3: iPhone with Telegram */}
      {frame < BROWSER_START + 15 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: phoneOpacity,
            transform: `scale(${phoneScale})`,
          }}
        >
          <IPhoneFrame>
            <TelegramChat
              showSecondPrompt={frame >= INPUT_SEND}
              secondPromptText={PROMPT_TEXT}
              inputFieldText={inputFieldText}
              showTyping={frame >= TYPING_START && frame < BOT_REPLY_START}
              showBotReply={frame >= BOT_REPLY_START}
              linkUrl={LINK_URL}
              scrollOffset={scrollOffset}
            />
          </IPhoneFrame>

          {/* Cursor tapping the link */}
          <AnimatedCursor
            appearFrame={CURSOR_APPEAR}
            clickFrame={CURSOR_CLICK}
            disappearFrame={CURSOR_DISAPPEAR}
            startX={56}
            startY={45}
            targetX={49}
            targetY={71}
          />
        </AbsoluteFill>
      )}

      {/* Scene 4: Browser */}
      {frame >= BROWSER_START && frame < ENDCARD_START + 15 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: browserOpacity * browserFadeOut,
            transform: `scale(${browserScale})`,
          }}
        >
          <BrowserScene screenshotFile="browser-recipe.png" url="md.page/D9GjKQ" />
        </AbsoluteFill>
      )}

      {/* Scene 5: End card */}
      {frame >= ENDCARD_START && (
        <AbsoluteFill style={{ opacity: endCardOpacity }}>
          <EndCard />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
