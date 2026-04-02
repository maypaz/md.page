import {
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
      {/* Logo: chevron icon + md.page text */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          transform: `scale(${logoScale})`,
        }}
      >
        <svg width="56" height="56" viewBox="0 0 48 48">
          <rect width="48" height="48" rx="11" fill="#4285F4"/>
          <g stroke="#fff" strokeWidth="4.5" strokeLinecap="round" fill="none" transform="translate(11, 8)">
            <line x1="11" y1="2" x2="7" y2="32"/>
            <line x1="21" y1="2" x2="17" y2="32"/>
            <line x1="4" y1="11" x2="25" y2="11"/>
            <line x1="3" y1="23" x2="24" y2="23"/>
          </g>
        </svg>
        <span
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            letterSpacing: -1,
          }}
        >
          md.page
        </span>
      </div>

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
