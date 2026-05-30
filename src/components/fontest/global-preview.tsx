import { useEffect, useRef } from "react";
import { useFontStore } from "@/store/font-store";
import { PencilLine } from "lucide-react";

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
    <div className="mb-6 w-full">
      <div className="group relative">
        <PencilLine
          size={23}
          className="text-muted-foreground/40 group-focus-within:text-foreground/70 absolute top-1/2 left-1 -translate-y-1/2 transition-colors"
        />

        <textarea
          ref={textareaRef}
          rows={1}
          onChange={(e) => setPreview(e.target.value)}
          placeholder="Type global preview text…"
          className="placeholder:text-muted-foreground/40 w-full resize-none overflow-hidden border-0 bg-transparent py-3 pr-0 pl-12 text-3xl leading-relaxed font-medium outline-none"
        />
        <div className="bg-foreground/20 absolute bottom-0 left-0 h-0.5 w-full" />
        <div className="bg-foreground/50 absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 ease-out group-focus-within:w-full" />
      </div>
    </div>
  );
}

export default GlobalPreview;
