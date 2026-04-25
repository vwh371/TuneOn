export default function Header({
  greetingName,
  onLogout,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  searchStatus,
}) {
  return (
    <header className="rounded-4xl border border-white/12 bg-black/35 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/7 text-white/80 transition hover:bg-white/15"
          aria-label="Open devices"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path
              fill="currentColor"
              d="M3 6a3 3 0 013-3h12a3 3 0 013 3v7.5a3 3 0 01-3 3h-1.5a.75.75 0 010-1.5H18a1.5 1.5 0 001.5-1.5V6A1.5 1.5 0 0018 4.5H6A1.5 1.5 0 004.5 6v7.5A1.5 1.5 0 006 15h1.5a.75.75 0 010 1.5H6a3 3 0 01-3-3V6zm9 13.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm0 1.5a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5z"
            />
          </svg>
        </button>

        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-linear-to-br from-white/35 to-white/8 text-sm font-bold text-white/90">
          {greetingName?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onLogout}
          className="ml-auto rounded-xl border border-rose-300/35 bg-rose-300/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/20"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
