import { Command } from "cmdk";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFontStore } from "@/store/font-store";
import { Sun, Moon, Upload, Trash2, LayoutGrid, List, Rows3, Maximize } from "lucide-react";
import { toast } from "sonner";
import { clearAllStorage } from "@/store/font-store";

export function CommandPalette() {
  const s = useFontStore();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        s.set({ paletteOpen: !s.paletteOpen });
      }
      if (e.key === "Escape") s.set({ paletteOpen: false });
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [s]);

  function close() {
    s.set({ paletteOpen: false });
  }
  function setTheme(t: "light" | "dark") {
    s.set({ theme: t });
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem("akara:theme", t);
  }

  return (
    <AnimatePresence>
      {s.paletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/20 p-4 pt-[15vh] backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover shadow-float"
          >
            <Command
              label="Command palette"
              className="**:[[cmdk-input]]:h-12 **:[[cmdk-input]]:w-full **:[[cmdk-input]]:border-b **:[[cmdk-input]]:border-border **:[[cmdk-input]]:bg-transparent **:[[cmdk-input]]:px-4 **:[[cmdk-input]]:outline-none"
            >
              <Command.Input placeholder="Type a command or search…" />
              <Command.List className="max-h-[60vh] overflow-auto p-2">
                <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results.
                </Command.Empty>
                <Command.Group
                  heading="Actions"
                  className="**[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:text-muted-foreground"
                >
                  <Item
                    icon={Upload}
                    onSelect={() => {
                      close();
                      document.querySelector<HTMLInputElement>("input[type=file]")?.click();
                    }}
                  >
                    Upload fonts
                  </Item>
                  <Item
                    icon={Sun}
                    onSelect={() => {
                      setTheme("light");
                      close();
                    }}
                  >
                    Light theme
                  </Item>
                  <Item
                    icon={Moon}
                    onSelect={() => {
                      setTheme("dark");
                      close();
                    }}
                  >
                    Dark theme
                  </Item>
                  <Item
                    icon={Trash2}
                    onSelect={async () => {
                      await clearAllStorage();
                      location.reload();
                    }}
                  >
                    Clear all fonts
                  </Item>
                </Command.Group>
                <Command.Group
                  heading="View"
                  className="**[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:text-muted-foreground"
                >
                  <Item
                    icon={LayoutGrid}
                    onSelect={() => {
                      s.set({ view: "grid" });
                      close();
                    }}
                  >
                    Grid view
                  </Item>
                  <Item
                    icon={List}
                    onSelect={() => {
                      s.set({ view: "list" });
                      close();
                    }}
                  >
                    List view
                  </Item>
                  <Item
                    icon={Rows3}
                    onSelect={() => {
                      s.set({ view: "compact" });
                      close();
                    }}
                  >
                    Compact view
                  </Item>

                </Command.Group>
                <Command.Group
                  heading="Fonts"
                  className="**[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:text-muted-foreground"
                >
                  {s.fonts.slice(0, 20).map((f) => (
                    <Command.Item
                      key={f.id}
                      value={f.originalName}
                      onSelect={() => {
                        navigator.clipboard.writeText(f.originalName);
                        toast.success("Copied font name");
                        close();
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-accent"
                    >
                      <span
                        style={{ fontFamily: `"${f.family}", system-ui` }}
                        className="truncate text-base"
                      >
                        {f.originalName}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Item({
  icon: Icon,
  children,
  onSelect,
}: {
  icon: any;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-accent"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {children}
    </Command.Item>
  );
}
