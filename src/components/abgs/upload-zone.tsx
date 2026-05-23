import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileType, ShieldCheck } from "lucide-react";
import { useFontStore } from "@/store/font-store";
import { toast } from "sonner";
import { isFontFile } from "@/lib/font-utils";
import { useState } from "react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

export function UploadZone() {
  const addFiles = useFontStore((s) => s.addFiles);
  const [loading, setLoading] = useState(false);

  const process = async (files: File[]) => {
    const fonts = files.filter((f) => isFontFile(f.name));
    if (!fonts.length) return toast.error("No supported font files found");
    setLoading(true);
    await addFiles(fonts);
    setLoading(false);
    toast.success(`Loaded ${fonts.length} font${fonts.length > 1 ? "s" : ""}`);
  };

  const onDrop = async (accepted: File[]) => {
    process(accepted);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    multiple: true,
    noClick: true,
    onDrop,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto mb-7 max-w-3xl"
    >
      {/* Enhanced drop zone */}
      <div
        {...getRootProps()}
        className={`
          group relative overflow-hidden rounded-2xl border-2 border-dashed 
          transition-all duration-300 ease-out
          ${
            isDragActive
              ? "border-indigo-500/50 bg-indigo-500/5 dark:border-indigo-400/50 dark:bg-indigo-400/5"
              : "border-neutral-300 bg-white hover:border-indigo-400/40 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-indigo-500/30 dark:hover:bg-neutral-800/50"
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Animated background overlay on drag */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-purple-500/5 dark:from-indigo-400/5 dark:via-transparent dark:to-purple-400/5"
            />
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center p-8">
          {/* Enhanced icon container */}
          <motion.div
            animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className={`
              relative mb-6 flex h-16 w-16 items-center justify-center rounded-xl 
              transition-all duration-300
              ${
                isDragActive
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 shadow-lg shadow-indigo-500/20 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-400 dark:shadow-indigo-400/20"
                  : "border-neutral-200 bg-white text-neutral-400 shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500 dark:group-hover:border-indigo-700 dark:group-hover:text-indigo-400"
              }
            `}
          >
            <Upload
              size={24}
              strokeWidth={1.5}
              className={`transition-transform duration-300 ${isDragActive ? "scale-110" : ""}`}
            />
          </motion.div>

          {/* Enhanced heading */}
          <div className="text-center">
            <p className="text-base font-medium text-neutral-700 dark:text-neutral-200">
              {isDragActive ? (
                <span className="text-indigo-600 dark:text-indigo-400">
                  Drop your fonts here
                </span>
              ) : (
                <>
                  Drag & drop or{" "}
                  <button
                    type="button"
                    onClick={open}
                    className="relative cursor-pointer font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    choose files
                  </button>{" "}
                  to upload
                </>
              )}
            </p>
            <p className="mt-2 text-[13px] text-neutral-500 dark:text-neutral-400">
              Select multiple font files to load them all at once
            </p>
          </div>

          {/* Enhanced divider with accent */}
          <div className="my-8 flex w-72 items-center gap-3">
            <Separator
              orientation="horizontal"
              className="flex-1 bg-neutral-200 dark:bg-neutral-700"
            />
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              supported formats
            </span>
            <Separator
              orientation="horizontal"
              className="flex-1 bg-neutral-200 dark:bg-neutral-700"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={open}
            disabled={loading}
            className="flex items-center"
          >
            <FileType size={23} />
            <div>{loading ? "Loading..." : "Select Font Files"}</div>
          </Button>
        </div>
      </div>

      {/* Enhanced footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between px-2 gap-3">
        {/* Privacy badge */}
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
          <ShieldCheck
            size={16}
            className="text-emerald-500 dark:text-emerald-400"
          />
          <span>Stored locally · Private & secure</span>
        </div>
      </div>
    </motion.div>
  );
}
