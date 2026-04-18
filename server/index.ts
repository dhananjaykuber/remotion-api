import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import express from "express";
import { z } from "zod";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { VideoProps } from "../src/types";

const app = express();

const port = Number(process.env.PORT ?? 4000);
const composition_id = "post-video";
const project_root = process.cwd();
const entry_point = path.join(project_root, "index.ts");
const out_dir = path.join(project_root, "out");
const public_base_url = process.env.PUBLIC_BASE_URL ?? `http://localhost:${port}`;

let serve_url_promise: Promise<string> | null = null;

const render_request_schema = z.object({
  title: z.string().min(1).max(180),
  excerpt: z.string().min(1).max(4000),
  image: z.string().url().or(z.literal("")).optional().default(""),
  siteName: z.string().min(1).max(120),
});

const getServeUrl = async (): Promise<string> => {
  if (!serve_url_promise) {
    serve_url_promise = bundle({
      entryPoint: entry_point,
      webpackOverride: (config) => config,
    });
  }

  return serve_url_promise;
};

const buildVideoProps = (
  payload: z.infer<typeof render_request_schema>
): VideoProps => {
  const scenes = payload.excerpt
    .replace(/\s+/g, " ")
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);

  return {
    title: payload.title,
    scenes: scenes.length > 0 ? scenes : [payload.excerpt.trim()],
    image: payload.image,
    siteName: payload.siteName,
  };
};

app.use(express.json({ limit: "2mb" }));
app.use("/videos", express.static(out_dir));

app.get("/health", (_req, res) => {
  res.json({ success: true, status: "ok" });
});

app.post("/render", async (req, res) => {
  const parsed = render_request_schema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: "Invalid request body",
      issues: parsed.error.issues,
    });
    return;
  }

  const input_props = buildVideoProps(parsed.data);
  const filename = `video-${Date.now()}-${crypto.randomUUID()}.mp4`;
  const output_location = path.join(out_dir, filename);

  try {
    await fs.mkdir(out_dir, { recursive: true });

    const serve_url = await getServeUrl();
    const composition = await selectComposition({
      serveUrl: serve_url,
      id: composition_id,
      inputProps: input_props,
    });

    await renderMedia({
      serveUrl: serve_url,
      composition,
      codec: "h264",
      outputLocation: output_location,
      inputProps: input_props,
    });

    const video_url = `${public_base_url}/videos/${filename}`;

    res.json({
      success: true,
      video_url,
    });
  } catch (error: unknown) {
    const error_message =
      error instanceof Error ? error.message : "Unexpected render error";

    res.status(500).json({
      success: false,
      error: error_message,
    });
  }
});

app.listen(port, () => {
  console.log(`Remotion API listening on port ${port}`);
});
