import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validation
    if (!formData.agree) {
      setError("Please agree to the terms and privacy policy");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess(`Welcome, ${data.user.name}! Redirecting...`);

      // Redirect after success
      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(29,185,84,0.2),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_28%),linear-gradient(135deg,#07110a_0%,#0b1610_45%,#08110d_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-4xl border border-white/10 bg-[#0c120f]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#1db954] shadow-[0_0_18px_rgba(29,185,84,0.7)]" />
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">TuneOn</span>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#1db954]">Join now</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Create your account and start building your vibe.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              Sign up for TuneOn to save playlists, follow artists, and keep every session synced across your devices.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Playlists", value: "Unlimited" },
              { label: "Discovery", value: "Personalized" },
              { label: "Sync", value: "Every device" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">{item.label}</p>
                <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-4xl border border-white/10 bg-white/8 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="mx-auto max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-white">Sign up</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Create your TuneOn profile and jump into the music.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white/80">Full name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Johnson"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#1db954] focus:bg-white/8 focus:ring-4 focus:ring-[#1db954]/20"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-white/80">Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@tuneon.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#1db954] focus:bg-white/8 focus:ring-4 focus:ring-[#1db954]/20"
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-white/80">Password</span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#1db954] focus:bg-white/8 focus:ring-4 focus:ring-[#1db954]/20"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-white/80">Confirm password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#1db954] focus:bg-white/8 focus:ring-4 focus:ring-[#1db954]/20"
                  />
                </label>
              </div>

              <label className="flex items-start gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-[#1db954] accent-[#1db954] focus:ring-[#1db954]"
                />
                <span>
                  I agree to the TuneOn terms and privacy policy.
                </span>
              </label>

              {error && <p className="rounded-lg bg-red-900/20 border border-red-500/30 px-4 py-3 text-sm text-red-300">{error}</p>}

              {success && <p className="rounded-lg bg-green-900/20 border border-green-500/30 px-4 py-3 text-sm text-green-300">{success}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-full bg-[#1db954] px-5 py-3.5 text-sm font-bold text-black shadow-[0_18px_40px_rgba(29,185,84,0.3)] transition hover:-translate-y-0.5 hover:bg-[#29d15f] hover:shadow-[0_22px_48px_rgba(29,185,84,0.4)] focus:outline-none focus:ring-4 focus:ring-[#1db954]/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>

              <p className="text-center text-sm text-white/55">
                Already have an account? <a href="/" className="font-semibold text-[#1db954] hover:text-[#4ef08a]">Log in</a>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}