import {
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100, mass: 0.8 },
  });

  const taglineOpacity = interpolate(frame, [15, 30], [0, 1], {
    ...CLAMP,
  });

  const taglineY = interpolate(frame, [15, 30], [10, 0], {
    ...CLAMP,
  });

  const subtitleOpacity = interpolate(frame, [30, 45], [0, 1], {
    ...CLAMP,
  });

  const subtitleY = interpolate(frame, [30, 45], [8, 0], {
    ...CLAMP,
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Logo */}
      <Img
        src={staticFile("logo.png")}
        style={{
          height: 90,
          transform: `scale(${logoScale})`,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontSize: 20,
          color: "#6b7280",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          marginTop: 4,
        }}
      >
        Markdown in, beautiful page out. ✨
      </div>

      {/* Free & open source */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#1a1a1a",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          marginTop: 8,
        }}
      >
        Free &amp; open source.
      </div>

      {/* No accounts line */}
      <div
        style={{
          fontSize: 14,
          color: "#6b7280",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
        }}
      >
        No accounts, no API keys, no limits.
      </div>
    </div>
  );
};
