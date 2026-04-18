export type VideoProps = {
  title: string;
  scenes: string[];
  image: string;
  siteName: string;
};

export const default_video_props: VideoProps = {
  title: "How to Turn a Blog Post into a Short Video",
  scenes: [
    "Use one strong hook in the first 3 seconds.",
    "Break the idea into 2 or 3 simple points.",
    "End with a clear call to action to read more.",
  ],
  image: "https://picsum.photos/1080/1920",
  siteName: "Remotion API",
};
