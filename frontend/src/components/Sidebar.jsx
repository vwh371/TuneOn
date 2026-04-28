// Sidebar navigation configuration.
const menuItems = [
  { key: "home", label: "Home", active: true },
  { key: "explore", label: "Explore" },
  { key: "library", label: "Library" },
  { key: "upgrade", label: "Upgrade" },
];

// Sidebar playlist/library quick list.
const playlistItems = [
  { title: "Liked music", subtitle: "Auto playlist" },
  { title: "beats", subtitle: "Arjun Rai" },
  { title: "Episodes for later", subtitle: "Auto playlist" },
];

// Icon renderer for each sidebar menu item.
function MenuIcon({ type }) {
  // Home icon.
  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M12 3.8l8.2 6.44a1.5 1.5 0 01.58 1.18v7.08A2.5 2.5 0 0118.28 21H5.72a2.5 2.5 0 01-2.5-2.5v-7.08a1.5 1.5 0 01.58-1.18L12 3.8z"
        />
      </svg>
    );
  }

  // Explore icon.
  if (type === "explore") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M12 2.5a9.5 9.5 0 109.5 9.5A9.51 9.51 0 0012 2.5zm0 1.5a8 8 0 11-8 8 8.01 8.01 0 018-8zm4.52 4.96a.75.75 0 00-.82-.18l-5.9 2.25a.75.75 0 00-.44.44l-2.25 5.9a.75.75 0 001 .99l5.9-2.25a.75.75 0 00.44-.44l2.25-5.9a.75.75 0 00-.18-.82zM10.7 13.3l2.4-.91-.91 2.4-2.4.91.91-2.4z"
        />
      </svg>
    );
  }

  // Library icon.
  if (type === "library") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M8.75 3.5A2.25 2.25 0 006.5 5.75v12.5A2.25 2.25 0 008.75 20.5h8.5a2.25 2.25 0 002.25-2.25V7.75a.75.75 0 00-.22-.53l-3.5-3.5a.75.75 0 00-.53-.22h-6.5zm0 1.5h5.94l3.31 3.31v9.94a.75.75 0 01-.75.75h-8.5a.75.75 0 01-.75-.75V5.75A.75.75 0 018.75 5zm1.25 4.5a.75.75 0 000 1.5h4a.75.75 0 000-1.5h-4zm0 3.5a.75.75 0 000 1.5h4a.75.75 0 000-1.5h-4z"
        />
      </svg>
    );
  }

  // Default icon used for remaining menu items.
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M12 2.5a5.5 5.5 0 00-5.47 4.97l-.04.46V9H5a.75.75 0 000 1.5h1.49l.01.57c.1 2.2 1.08 4.13 2.59 5.48l-.36 1.36H7a.75.75 0 000 1.5h10a.75.75 0 000-1.5h-1.73l-.36-1.36c1.51-1.35 2.49-3.28 2.59-5.48l.01-.57H19a.75.75 0 000-1.5h-1.49v-1.07A5.5 5.5 0 0012 2.5zm4 8.5c0 2.53-1.66 4.7-4 5.44-2.34-.74-4-2.91-4-5.44V8a4 4 0 018 0v3z"
      />
    </svg>
  );
}

export default function Sidebar() {
  return (
    // Main sidebar container - now narrow and icon-only
    <aside className="fixed left-0 top-0 z-50 h-full w-20 shrink-0 border-r border-white/12 bg-black/80 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl overflow-y-auto">
      {/* Sidebar header: TuneOn logo */}
      <div className="flex items-center justify-center py-4">
        {/* TuneOn brand lockup - logo only */}
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-linear-to-br from-emerald-400/90 to-cyan-300/80 text-xs font-black tracking-wide text-black">
          TO
        </div>
      </div>

      {/* Primary navigation links - icons only */}
      <nav className="grid gap-1 px-2">
        {/* Render each navigation item */}
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`flex items-center justify-center rounded-lg p-3 transition ${
              item.active
                ? "bg-white/12 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
            title={item.label}
          >
            <span className="text-white/88">
              <MenuIcon type={item.key} />
            </span>
          </button>
        ))}
      </nav>

      {/* Visual divider between nav and actions */}
      <div className="mx-2 my-3 h-px bg-white/10" />

      {/* Playlist quick action - icon only */}
      <button
        type="button"
        className="mx-2 w-14 flex items-center justify-center rounded-lg border border-white/12 bg-white/8 p-3 text-lg font-semibold text-white transition hover:bg-white/16"
        title="New playlist"
      >
        <span>+</span>
      </button>
    </aside>
  );
}
