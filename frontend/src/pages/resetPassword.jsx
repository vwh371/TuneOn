import { useMemo, useState } from "react";

export default function ResetPassword() {
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  }, []);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset link is missing a token. Request a new password reset email.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not reset password");
        return;
      }

      setSuccess(data.message || "Password updated. You can now log in.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      setError(err.message || "Could not reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(29,185,84,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_28%),linear-gradient(135deg,#07110a_0%,#0b1610_45%,#08110d_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-3xl items-center">
        <section className="rounded-4xl border border-white/10 bg-[#0c120f]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#1db954] shadow-[0_0_18px_rgba(29,185,84,0.7)]" />
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">TuneOn</span>
          </div>

          <div className="mt-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Set a new password</h1>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Use your reset link to choose a new password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/80">New password</span>
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
                placeholder="••••• •••"
                autoComplete="new-password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#1db954] focus:bg-white/8 focus:ring-4 focus:ring-[#1db954]/20"
              />
            </label>

            {error && <p className="rounded-lg border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">{error}</p>}
            {success && <p className="rounded-lg border border-green-500/30 bg-green-900/20 px-4 py-3 text-sm text-green-300">{success}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-full bg-[#1db954] px-5 py-3.5 text-sm font-bold text-black shadow-[0_18px_40px_rgba(29,185,84,0.3)] transition hover:-translate-y-0.5 hover:bg-[#29d15f] hover:shadow-[0_22px_48px_rgba(29,185,84,0.4)] focus:outline-none focus:ring-4 focus:ring-[#1db954]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Updating password..." : "Reset password"}
            </button>

            <p className="text-center text-sm text-white/55">
              Back to <a href="/" className="font-semibold text-[#1db954] hover:text-[#4ef08a]">login</a>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
