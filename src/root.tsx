import React from "react";
import { Composition } from "remotion";
import { default_video_props } from "./types";
import { VideoComposition } from "./video";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="post-video"
        component={VideoComposition}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={default_video_props}
      />
    </>
  );
};
