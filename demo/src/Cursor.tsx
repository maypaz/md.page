import { useCurrentFrame, interpolate, Easing } from "remotion";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE_IN_OUT = Easing.inOut(Easing.ease);

// macOS-style pointer cursor
const CursorSvg: React.FC<{ pressed: boolean }> = ({ pressed }) => (
  <svg
    width="24"
    height="30"
    viewBox="0 0 24 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
      transform: pressed ? "scale(0.9)" : "scale(1)",
      transformOrigin: "top left",
    }}
  >
    <path
      d="M2 1L2 22L7.5 17L12.5 26L16 24.5L11 15.5L18 14.5L2 1Z"
      fill="white"
      stroke="black"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

interface CursorProps {
  // Cursor appears, moves to target, clicks, then disappears
  appearFrame: number;  // when cursor fades in
  clickFrame: number;   // when cursor "clicks"
  disappearFrame: number; // when cursor fades out
  // Position: percentage of parent container
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

export const AnimatedCursor: React.FC<CursorProps> = ({
  appearFrame,
  clickFrame,
  disappearFrame,
  startX,
  startY,
  targetX,
  targetY,
}) => {
  const frame = useCurrentFrame();

  // Visibility
  const opacity = interpolate(
    frame,
    [appearFrame, appearFrame + 5, disappearFrame - 3, disappearFrame],
    [0, 1, 1, 0],
    CLAMP,
  );

  if (opacity === 0) return null;

  // Movement from start to target
  const moveStart = appearFrame + 3;
  const moveEnd = clickFrame - 2;
  const moveProgress = interpolate(
    frame,
    [moveStart, Math.max(moveEnd, moveStart + 1)],
    [0, 1],
    {
      ...CLAMP,
      easing: EASE_IN_OUT,
    },
  );

  const x = interpolate(moveProgress, [0, 1], [startX, targetX]);
  const y = interpolate(moveProgress, [0, 1], [startY, targetY]);

  // Click effect
  const isPressed = frame >= clickFrame && frame <= clickFrame + 4;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        opacity,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <CursorSvg pressed={isPressed} />
    </div>
  );
};
