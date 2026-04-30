import { useState, useEffect } from "react";
import Header from "../../components/Header";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    preferences: {
      genres: [],
      artist: "",
      language: "",
    },
  });
  const [availableGenres] = useState([
    "Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Classical", "R&B", "Country", "Metal", "Folk"
  ]);
  const [languages] = useState(["English", "Spanish", "French", "German", "Japanese", "Korean", "Hindi"]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.replace("/");
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          preferences: data.user.preferences || { genres: [], artist: "", language: "" },
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          preferences: formData.preferences,
        }),
      });

      if (response.ok) {
        setEditing(false);
        fetchProfile();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const toggleGenre = (genre) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        genres: prev.preferences.genres.includes(genre)
          ? prev.preferences.genres.filter((g) => g !== genre)
          : [...prev.preferences.genres, genre],
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_10%_15%,rgba(29,185,84,0.24),transparent_35%)] px-4 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-[#1db954]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_15%,rgba(29,185,84,0.24),transparent_35%),radial-gradient(circle_at_90%_5%,rgba(59,130,246,0.2),transparent_28%),radial-gradient(circle_at_50%_120%,rgba(234,179,8,0.15),transparent_32%),linear-gradient(155deg,#040b08_0%,#091914_45%,#070f1a_100%)] px-4 py-8 pb-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="mb-8 rounded-3xl border border-white/12 bg-gradient-to-br from-[#1db954]/10 to-transparent p-8 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#1db954] to-emerald-600 text-3xl font-bold text-white shadow-xl">
                {formData.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[#040b08] bg-[#1db954]" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">Your Profile</h1>
              <p className="mt-1 text-white/60">Manage your personal information and preferences</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="rounded-full bg-white/10 px-6 py-2.5 font-semibold text-white transition hover:bg-white/20"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        {editing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-8">
            {/* Basic Info */}
            <div className="rounded-2xl border border-white/12 bg-[#0d1519]/95 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Display Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none transition focus:border-[#1db954]/50 focus:ring-1 focus:ring-[#1db954]/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white/50 outline-none"
                  />
                  <p className="mt-1 text-xs text-white/40">Email cannot be changed</p>
                </div>
              </div>
            </div>

            {/* Music Preferences */}
            <div className="rounded-2xl border border-white/12 bg-[#0d1519]/95 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Music Preferences</h2>
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-medium text-white/70">Favorite Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {availableGenres.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          formData.preferences.genres.includes(genre)
                            ? "bg-gradient-to-r from-[#1db954] to-emerald-600 text-white shadow-lg"
                            : "border border-white/15 bg-white/5 text-white/70 hover:bg-white/15"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Favorite Artist</label>
                  <input
                    type="text"
                    value={formData.preferences.artist}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, artist: e.target.value },
                      })
                    }
                    placeholder="e.g., Taylor Swift, Drake, BTS"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none transition focus:border-[#1db954]/50 focus:ring-1 focus:ring-[#1db954]/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Preferred Language</label>
                  <select
                    value={formData.preferences.language}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, language: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none transition focus:border-[#1db954]/50 focus:ring-1 focus:ring-[#1db954]/30"
                  >
                    <option value="">Select language</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-r from-[#1db954] to-emerald-600 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-[#1db954]/30"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 font-semibold text-white/80 transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            {/* Basic Info Display */}
            <div className="rounded-2xl border border-white/12 bg-[#0d1519]/95 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Basic Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/60">Display Name</span>
                  <span className="font-medium text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/60">Email</span>
                  <span className="font-medium text-white">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Member Since</span>
                  <span className="font-medium text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Music Preferences Display */}
            <div className="rounded-2xl border border-white/12 bg-[#0d1519]/95 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Music Preferences</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-white/60">Favorite Genres</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.preferences.genres?.length > 0 ? (
                      formData.preferences.genres.map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full bg-gradient-to-r from-[#1db954]/20 to-emerald-600/20 px-3 py-1 text-sm text-[#8ef2b1]"
                        >
                          {genre}
                        </span>
                      ))
                    ) : (
                      <span className="text-white/40">No genres selected</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-white/60">Favorite Artist</span>
                  <p className="mt-1 text-white">
                    {formData.preferences.artist || <span className="text-white/40">Not specified</span>}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-white/60">Preferred Language</span>
                  <p className="mt-1 text-white">
                    {formData.preferences.language || <span className="text-white/40">Not specified</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}