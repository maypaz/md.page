import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { TerminalScene } from "./TerminalScene";
import { BrowserScene } from "./BrowserScene";
import { EndCard } from "./EndCard";
import { AnimatedCursor } from "./Cursor";

// Timeline (frames at 30fps)
const PROMPT_START = 125; // second prompt appears
const SCROLL_START = 120; // start scrolling up before prompt
const PROMPT_END = 185; // URL appears

const CURSOR_APPEAR = 190; // cursor fades in
const CURSOR_CLICK = 205; // cursor clicks the link
const CURSOR_DISAPPEAR = 215; // cursor fades out

const TRANSITION_START = 215; // terminal → browser
const BROWSER_START = 228;

const ENDCARD_START = 360;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PROMPT_TEXT = "create md.page I can share";

export const MdPageDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Scroll offset: scroll terminal content up when second prompt appears ---
  const scrollSpring = spring({
    frame: frame - SCROLL_START,
    fps,
    config: { damping: 30, stiffness: 40, mass: 1 },
  });
  const scrollOffset = interpolate(scrollSpring, [0, 1], [0, 340]);

  // --- Terminal opacity ---
  const terminalOpacity = interpolate(
    frame,
    [TRANSITION_START, TRANSITION_START + 12],
    [1, 0],
    CLAMP,
  );

  const terminalScale = interpolate(
    frame,
    [TRANSITION_START, TRANSITION_START + 12],
    [1, 0.97],
    CLAMP,
  );

  // --- User prompt typing ---
  const promptChars = Math.min(
    PROMPT_TEXT.length,
    Math.floor(
      interpolate(frame, [PROMPT_START, PROMPT_START + 30], [0, PROMPT_TEXT.length], {
        ...CLAMP,
      }),
    ),
  );

  // --- Publishing & URL timing ---
  const showPublishing = frame >= PROMPT_START + 35 && frame < PROMPT_END;
  const showUrl = frame >= PROMPT_END;

  const urlGlow = interpolate(
    frame,
    [PROMPT_END, PROMPT_END + 15, PROMPT_END + 30],
    [0, 10, 4],
    CLAMP,
  );

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
    <AbsoluteFill style={{ background: "#1e1e2e" }}>

      {/* Scene 1-3: Terminal with Claude Code UI */}
      {frame < BROWSER_START + 15 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: terminalOpacity,
            transform: `scale(${terminalScale})`,
          }}
        >
          <TerminalScene
            showSecondPrompt={frame >= PROMPT_START}
            secondPromptChars={promptChars}
            secondPromptText={PROMPT_TEXT}
            showPublishing={showPublishing}
            showUrl={showUrl}
            urlGlow={urlGlow}
            scrollOffset={scrollOffset}
          />

          {/* Mouse cursor clicking the URL */}
          <AnimatedCursor
            appearFrame={CURSOR_APPEAR}
            clickFrame={CURSOR_CLICK}
            disappearFrame={CURSOR_DISAPPEAR}
            startX={50}
            startY={40}
            targetX={15}
            targetY={48}
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
          <BrowserScene />
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
