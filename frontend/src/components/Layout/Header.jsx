export default function Header({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  searchStatus,
}) {
  return (
    <header className="rounded-4xl border border-white/12 bg-black/35 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-white">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-linear-to-br from-emerald-400/90 to-cyan-300/80 text-[11px] font-black tracking-wide text-black">
            TO
          </div>
          <span className="text-lg font-bold tracking-tight">TuneOn</span>
        </div>

        <form onSubmit={onSearchSubmit} className="relative min-w-55 flex-1">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          >
            <path
              d="M10.5 3.75a6.75 6.75 0 015.364 10.848l4.269 4.269a.75.75 0 11-1.06 1.06l-4.27-4.269A6.75 6.75 0 1110.5 3.75zm0 1.5a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z"
              fill="currentColor"
            />
          </svg> 

          <input 
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search songs, albums, artists"
            className="w-full rounded-2xl border border-white/12 bg-white/9 py-3 pl-11 pr-24 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-white/35 focus:bg-white/12"
          />

          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl border border-[#1db954]/50 bg-[#1db954]/20 px-3 py-1.5 text-xs font-semibold text-[#9cf6bb] transition hover:bg-[#1db954]/30"
          >
            {searchStatus === "loading" ? "..." : "Search"}
          </button>
        </form>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/7 text-white/80 transition hover:bg-white/15"
          aria-label="Open profile"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path
              fill="currentColor"
              d="M12 2.5a6 6 0 014.12 10.36A8.5 8.5 0 0119.5 20a.75.75 0 01-1.5 0 7 7 0 00-14 0 .75.75 0 01-1.5 0 8.5 8.5 0 013.38-7.14A6 6 0 0112 2.5zm0 1.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
