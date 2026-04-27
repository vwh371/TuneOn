import { useState } from "react";

export default function MusicPreferences() {
  const [formData, setFormData] = useState({
    genres: [],
    artist: "",
    language: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const genres = [
    "Pop",
    "Rock",
    "Hip-Hop",
    "Jazz",
    "Classical",
    "Electronic",
    "R&B",
    "Country",
    "Reggae",
    "Latin",
  ];

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Chinese",
    "Japanese",
    "Korean",
    "Hindi",
  ];

  const genreArtistMap = {
    Pop: ["Taylor Swift", "Ariana Grande", "Dua Lipa", "The Weeknd"],
    Rock: ["Imagine Dragons", "Foo Fighters", "Arctic Monkeys", "Coldplay"],
    "Hip-Hop": ["Drake", "Kendrick Lamar", "Travis Scott", "Nicki Minaj"],
    Jazz: ["Miles Davis", "Billie Holiday", "Herbie Hancock", "Esperanza Spalding"],
    Classical: ["Ludovico Einaudi", "Yo-Yo Ma", "Lang Lang", "Hans Zimmer"],
    Electronic: ["Calvin Harris", "Daft Punk", "Zedd", "Skrillex"],
    "R&B": ["SZA", "Bruno Mars", "H.E.R.", "Alicia Keys"],
    Country: ["Taylor Swift", "Luke Combs", "Kacey Musgraves", "Morgan Wallen"],
    Reggae: ["Bob Marley", "Damian Marley", "Chronixx", "Toots and the Maytals"],
    Latin: ["Bad Bunny", "Shakira", "J Balvin", "Karol G"],
  };

  const suggestedArtists = Array.from(
    new Set(formData.genres.flatMap((genre) => genreArtistMap[genre] || [])),
  ).slice(0, 8);

  const handleGenreToggle = (genre) => {
    setFormData((current) => {
      const isSelected = current.genres.includes(genre);
      
      if (isSelected) {
        return {
          ...current,
          genres: current.genres.filter((g) => g !== genre),
        };
      } else if (current.genres.length < 3) {
        return {
          ...current,
          genres: [...current.genres, genre],
        };
      }
      
      return current;
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (formData.genres.length !== 3) {
      setError("Please select exactly 3 genres");
      setIsLoading(false);
      return;
    }

    if (!formData.artist || !formData.language) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          genres: formData.genres,
          artist: formData.artist,
          language: formData.language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save preferences");
        return;
      }

      // Redirect to home
      window.location.href = "/home";
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    window.location.href = "/home";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 ml-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to TuneOn</h1>
          <p className="text-gray-400 text-lg">Let's personalize your music experience</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Genre Select */}
          <div>
            <label className="block text-white font-semibold mb-3">
              Favorite Music Genres <span className="text-blue-400">({formData.genres.length}/3)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    formData.genres.includes(genre)
                      ? "bg-blue-500 text-white border-2 border-blue-400"
                      : "bg-white/10 text-gray-300 border-2 border-white/20 hover:border-white/40"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Artist Input */}
          <div>
            <label htmlFor="artist" className="block text-white font-semibold mb-3">
              Favorite Artist
            </label>
            <input
              type="text"
              id="artist"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              placeholder="Enter your favorite artist"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <label className="block text-white font-semibold">Suggested Artists</label>
              <span className="text-xs uppercase tracking-[0.24em] text-gray-400">Based on selected genres</span>
            </div>

            {suggestedArtists.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {suggestedArtists.map((artist) => (
                  <button
                    key={artist}
                    type="button"
                    onClick={() => setFormData((current) => ({ ...current, artist }))}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      formData.artist === artist
                        ? "border-blue-400 bg-blue-500/20 text-blue-100"
                        : "border-white/15 bg-white/5 text-gray-200 hover:border-white/35 hover:bg-white/10"
                    }`}
                  >
                    {artist}
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-gray-400">
                Pick up to 3 genres first to see matching artist suggestions.
              </p>
            )}
          </div>

          {/* Language Select */}
          <div>
            <label htmlFor="language" className="block text-white font-semibold mb-3">
              Preferred Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition"
            >
              <option value="">Select a language</option>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition transform hover:scale-105"
          >
            {isLoading ? "Saving..." : "Continue"}
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition border border-white/10"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
