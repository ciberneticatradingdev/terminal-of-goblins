'use client';

const ASCII_ART = `
 ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗
    ██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║
    ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║
    ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║
    ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝

 ██████╗ ███████╗     ██████╗  ██████╗ ██████╗ ██╗     ██╗███╗   ██╗███████╗
██╔═══██╗██╔════╝    ██╔════╝ ██╔═══██╗██╔══██╗██║     ██║████╗  ██║██╔════╝
██║   ██║█████╗      ██║  ███╗██║   ██║██████╔╝██║     ██║██╔██╗ ██║███████╗
██║   ██║██╔══╝      ██║   ██║██║   ██║██╔══██╗██║     ██║██║╚██╗██║╚════██║
╚██████╔╝██║         ╚██████╔╝╚██████╔╝██████╔╝███████╗██║██║ ╚████║███████║
 ╚═════╝ ╚═╝          ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
`.trim();

export default function TerminalHeader() {
  return (
    <header className="px-4 pt-6 pb-2">
      {/* ASCII art title */}
      <pre
        className="text-goblin-green text-glow text-[0.45rem] sm:text-[0.55rem] md:text-xs leading-tight overflow-x-auto"
        aria-label="Terminal of Goblins"
      >
        {ASCII_ART}
      </pre>

      {/* Divider */}
      <div className="mt-3 border-t border-goblin-dim opacity-60" />

      {/* Warning banner */}
      <div className="warning-banner mt-3 text-[0.7rem] tracking-widest uppercase animate-pulse">
        ⚠ WARNING: GOBLINS ARE UNPREDICTABLE — CONTENTS MAY CONTAIN GOBLIN LOGIC ⚠
      </div>

      {/* Subtitle */}
      <p className="text-center text-goblin-dim text-xs mt-2 tracking-wide">
        [DEEPCAVE NETWORK v0.0.1] — autonomous goblin terminal sessions — no human intervention
      </p>

      <div className="border-t border-goblin-dim opacity-40 mt-3" />
    </header>
  );
}
