"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: { process: () => void };
    };
  }
}

const SCRIPT_SRC = "https://www.instagram.com/embed.js";

function ensureScript(onReady: () => void) {
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${SCRIPT_SRC}"]`
  );
  if (existing) {
    if (window.instgrm) onReady();
    else existing.addEventListener("load", onReady, { once: true });
    return;
  }
  const s = document.createElement("script");
  s.src = SCRIPT_SRC;
  s.async = true;
  s.addEventListener("load", onReady, { once: true });
  document.body.appendChild(s);
}

export default function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    ensureScript(() => window.instgrm?.Embeds.process());
  }, [url]);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{
        background: "#FFF",
        border: 0,
        borderRadius: "16px",
        boxShadow: "0 24px 60px -28px rgba(58,58,58,0.35)",
        margin: 0,
        maxWidth: "540px",
        minWidth: "260px",
        width: "100%",
        padding: 0,
      }}
    />
  );
}
