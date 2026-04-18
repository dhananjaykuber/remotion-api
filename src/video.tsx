import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoProps } from "./types";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const VideoComposition: React.FC<VideoProps> = ({
  title,
  scenes,
  image,
  siteName,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const title_end = Math.floor(durationInFrames * 0.35);
  const cta_start = Math.floor(durationInFrames * 0.8);
  const middle_start = title_end;
  const middle_end = cta_start;

  const safe_scenes = scenes.length > 0 ? scenes : ["No scene content provided."];
  const scene_count = safe_scenes.length;
  const middle_duration = Math.max(1, middle_end - middle_start);
  const scene_duration = Math.max(1, Math.floor(middle_duration / scene_count));
  const scene_index = Math.min(
    scene_count - 1,
    Math.max(0, Math.floor((frame - middle_start) / scene_duration))
  );

  const title_opacity =
    frame <= title_end
      ? interpolate(frame, [0, 10, title_end - 10, title_end], [0, 1, 1, 0], clamp)
      : 0;
  const title_translate_y = interpolate(frame, [0, 20], [40, 0], clamp);

  const local_scene_frame = Math.max(
    0,
    frame - middle_start - scene_index * scene_duration
  );
  const scene_opacity =
    frame >= middle_start && frame < cta_start
      ? interpolate(
          local_scene_frame,
          [0, 8, scene_duration - 8, scene_duration],
          [0, 1, 1, 0],
          clamp
        )
      : 0;
  const scene_scale = spring({
    fps,
    frame: local_scene_frame,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.7,
    },
  });

  const cta_opacity =
    frame >= cta_start
      ? interpolate(
          frame,
          [cta_start, cta_start + 10, durationInFrames - 10, durationInFrames],
          [0, 1, 1, 0],
          clamp
        )
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#111111", color: "#ffffff" }}>
      {image ? (
        <Img
          src={image}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          padding: "96px 72px",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
          lineHeight: 1.15,
        }}
      >
        <div
          style={{
            opacity: title_opacity,
            transform: `translateY(${title_translate_y}px)`,
            position: "absolute",
            left: 72,
            right: 72,
            top: 180,
          }}
        >
          <div style={{ fontSize: 28, opacity: 0.9, marginBottom: 20 }}>{siteName}</div>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -1.5 }}>{title}</div>
        </div>

        <div
          style={{
            opacity: scene_opacity,
            transform: `scale(${0.96 + scene_scale * 0.04})`,
            position: "absolute",
            left: 72,
            right: 72,
            top: "42%",
            padding: "42px 38px",
            borderRadius: 24,
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.16)",
          }}
        >
          <div style={{ fontSize: 24, opacity: 0.72, marginBottom: 16 }}>
            Point {scene_index + 1}
          </div>
          <div style={{ fontSize: 60, fontWeight: 600, letterSpacing: -1.2 }}>
            {safe_scenes[scene_index]}
          </div>
        </div>

        <div
          style={{
            opacity: cta_opacity,
            position: "absolute",
            left: 72,
            right: 72,
            bottom: 180,
            padding: "26px 30px",
            borderRadius: 18,
            background: "rgba(255,255,255,0.94)",
            color: "#111111",
            fontSize: 46,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Read more on {siteName}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
