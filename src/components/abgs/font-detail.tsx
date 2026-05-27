import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Download, Copy, WholeWord, Baseline, InfoIcon } from "lucide-react";
import { useFontStore } from "@/store/font-store";
import { humanSize } from "@/lib/font-utils";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Separator } from "../ui/separator";

const SPECIMENS = [
  { size: 80, text: "Aa" },
  { size: 54, text: "The quick brown fox jumps over the lazy dog." },
  { size: 36, text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  { size: 28, text: "abcdefghijklmnopqrstuvwxyz" },
  { size: 28, text: "0123456789 !@#$%^&*()" },
];

const GLYPHS = Array.from({ length: 95 }, (_, i) =>
  String.fromCharCode(32 + i),
);

export function FontDetail({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const font = useFontStore((s) => s.fonts.find((f) => f.id === id));
  const { weight, lineHeight, letterSpacing } = useFontStore();
  const download = useFontStore((s) => s.downloadFont);
  const loadFontOnDemand = useFontStore((s) => s.loadFontOnDemand);

  const copyText = (text: string, message = "Copied") => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const tabs = [
    { id: "specimen", label: "Specimen", icon: <WholeWord size={20} /> },
    { id: "glyphs", label: "Glyphs", icon: <Baseline size={20} /> },
    { id: "info", label: "Info", icon: <InfoIcon size={20} /> },
  ] as const;

  type Tab = (typeof tabs)[number]["id"];
  const [tab, setTab] = useState<Tab>("specimen");

  useEffect(() => {
    if (id) {
      document.body.style.overflow = "hidden";
      loadFontOnDemand(id);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [id, loadFontOnDemand]);

  const fontFamily = useMemo(
    () => (font ? `"${font.family}", system-ui` : ""),
    [font],
  );

  const metadata = font?.metadata;

  const infoItems: Array<{ label: string; value: string }> = font
    ? [
        { label: "File name", value: font.originalName },
        { label: "Family (internal)", value: font.family },
        { label: "Format", value: font.format.toUpperCase() },
        { label: "Size", value: humanSize(font.size) },
        { label: "Added", value: new Date(font.addedAt).toLocaleString() },
        ...(metadata?.version
          ? [{ label: "Version", value: metadata.version }]
          : []),
        ...(metadata?.designer
          ? [{ label: "Creator", value: metadata.designer }]
          : metadata?.manufacturer
            ? [{ label: "Creator", value: metadata.manufacturer }]
            : []),
        ...(metadata?.copyright
          ? [{ label: "Copyright", value: metadata.copyright }]
          : []),
        ...(metadata?.trademark
          ? [{ label: "Trademark", value: metadata.trademark }]
          : []),
        ...(metadata?.license
          ? [{ label: "License", value: metadata.license }]
          : []),
        ...(metadata?.vendorURL
          ? [{ label: "Vendor URL", value: metadata.vendorURL }]
          : []),
        ...(metadata?.designerURL
          ? [{ label: "Designer URL", value: metadata.designerURL }]
          : []),
        ...(metadata?.description
          ? [{ label: "Description", value: metadata.description }]
          : []),
        ...(metadata?.createdAt
          ? [
              {
                label: "Created",
                value: new Date(metadata.createdAt).toLocaleString(),
              },
            ]
          : []),
        ...(metadata?.modifiedAt
          ? [
              {
                label: "Modified",
                value: new Date(metadata.modifiedAt).toLocaleString(),
              },
            ]
          : []),
      ]
    : [];

  return (
    <AnimatePresence>
      {id && font && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/10 backdrop-blur-xs p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-float"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">
                  {font.originalName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {font.format.toUpperCase()} · {humanSize(font.size)}
                </p>
              </div>
              <div className="flex items-center gap-5">
                <TooltipProvider>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyText(font.originalName)}
                        >
                          <Copy size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Copy name</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => download(font.id)}
                        >
                          <Download size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Download</TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" className="h-4 mx-2" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={onClose}
                        >
                          <X size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Close</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex gap-1 border-b border-border px-6">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`relative flex gap-2 font-medium px-4 items-center cursor-pointer py-3 text-sm transition ${tab === item.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {item.icon}
                  {item.label}
                  {tab === item.id && (
                    <motion.div
                      layoutId="tab"
                      className="absolute inset-x-3 -bottom-px h-0.5 bg-foreground"
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-8">
              {tab === "specimen" && (
                <div
                  className="space-y-10"
                  style={{
                    fontFamily: fontFamily,
                    fontWeight: weight,
                    lineHeight,
                    letterSpacing: `${letterSpacing}px`,
                  }}
                >
                  {SPECIMENS.map((s, i) => (
                    <div
                      key={i}
                      style={{ fontSize: s.size }}
                      className="wrap-break-word border-b border-border pt-6"
                    >
                      {s.text}
                    </div>
                  ))}
                </div>
              )}
              {tab === "glyphs" && (
                <div
                  className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16"
                  style={{ fontFamily: fontFamily }}
                >
                  {GLYPHS.map((glyph, i) => (
                    <button
                      key={i}
                      onClick={() => copyText(glyph, `Copied ${glyph}`)}
                      className="flex aspect-square cursor-pointer items-center justify-center border border-foreground/20 bg-background text-2xl transition hover:border-foreground/40 hover:bg-accent"
                    >
                      {glyph}
                    </button>
                  ))}
                </div>
              )}
              {tab === "info" && (
                <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  {infoItems.map((item) => (
                    <InfoItem
                      key={item.label}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </dl>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  const renderValue = (text: string) => {
    const linkRegex =
      /(https?:\/\/[^\s)]+|www\.[^\s)]+|[^\s@.,;:!?"'()]+@[^\s@.,;:!?"'()]+\.[^\s@.,;:!?"'()]+)/gi;
    const urlOnlyRegex = /^(https?:\/\/[^\s)]+|www\.[^\s)]+)$/i;
    const emailOnlyRegex =
      /^[^\s@.,;:!?"'()]+@[^\s@.,;:!?"'()]+\.[^\s@.,;:!?"'()]+$/;

    const parts = text.split(linkRegex);
    if (parts.length === 1) return text;

    return parts.map((part, index) => {
      if (!part) return null;
      if (emailOnlyRegex.test(part)) {
        return (
          <a
            key={index}
            href={`mailto:${part}`}
            className="text-primary underline"
          >
            {part}
          </a>
        );
      }
      if (urlOnlyRegex.test(part)) {
        const href = part.startsWith("http") ? part : `https://${part}`;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="p-4">
      <dt className="text-sm font-medium  uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-base break-all font-medium">
        {renderValue(value)}
      </dd>
    </div>
  );
}
