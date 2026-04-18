import fs from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { default_video_props } from "../src/types";

const composition_id = "post-video";

const renderTestVideo = async (): Promise<void> => {
  const project_root = process.cwd();
  const entry_point = path.join(project_root, "index.ts");
  const out_dir = path.join(project_root, "out");
  const output_location = path.join(out_dir, "test.mp4");

  // Keep local test rendering deterministic and independent of external images.
  const render_props = { ...default_video_props, image: "" };

  await fs.mkdir(out_dir, { recursive: true });

  const serve_url = await bundle({
    entryPoint: entry_point,
    webpackOverride: (config) => config,
  });

  const composition = await selectComposition({
    serveUrl: serve_url,
    id: composition_id,
    inputProps: render_props,
  });

  await renderMedia({
    composition,
    serveUrl: serve_url,
    codec: "h264",
    outputLocation: output_location,
    inputProps: render_props,
  });

  console.log(`Video rendered successfully: ${output_location}`);
};

renderTestVideo().catch((error: unknown) => {
  console.error("Video render failed.", error);
  process.exit(1);
});
