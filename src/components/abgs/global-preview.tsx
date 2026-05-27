import React, { useEffect, useRef } from "react";
import { useFontStore } from "@/store/font-store";

export function GlobalPreview() {
  const previewText = useFontStore((s) => s.previewText);
  const setPreview = useFontStore((s) => s.setPreview);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [previewText]);

  return (
    <div className="w-full px-4 mb-4">
      <label className="block text-xs text-muted-foreground mb-2">
        Global preview text
      </label>
      <textarea
        ref={textareaRef}
        rows={1}
        value={previewText}
        onChange={(e) => setPreview(e.target.value)}
        placeholder="Type global preview text…"
        className="block w-full resize-none overflow-hidden bg-card/50 border border-border rounded-md px-3 py-2 outline-none leading-tight placeholder:opacity-30"
      />
    </div>
  );
}

export default GlobalPreview;
