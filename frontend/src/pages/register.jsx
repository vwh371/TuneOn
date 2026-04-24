import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import AppleSignin from "react-apple-signin-auth";

function GoogleLogoButton({ onSuccess, onError }) {
  const googleLogin = useGoogleLogin({
    onSuccess,
    onError,
    scope: "openid email profile",
    prompt: "select_account",
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.4-5.5 3.4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 2.9 14.5 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.7-4.1 9.7-9.9 0-.7-.1-1.3-.2-1.9H12z" />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID;
  const appleRedirectUri = import.meta.env.VITE_APPLE_REDIRECT_URI;

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
      setSuccess(`Welcome, ${data.user.name}! Setting up your preferences...`);

      // Redirect after success
      setTimeout(() => {
        window.location.href = "/music-preferences";
      }, 1500);
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const finishSocialAuth = (data, welcomePrefix = "Welcome") => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setSuccess(`${welcomePrefix}, ${data.user.name}! Redirecting...`);

    setTimeout(() => {
      window.location.href = "/home";
    }, 1200);
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setError("");
    setSuccess("");
    setSelectedGoogleAccount(null);
    setIsGoogleLoading(true);

    try {
      if (!tokenResponse?.access_token) {
        setError("Google did not return an access token. Please try again.");
        return;
      }

      const response = await fetch("/api/auth/google/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: tokenResponse.access_token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Google sign-in failed");
        return;
      }

      setSelectedGoogleAccount({
        email: data.user?.email || "",
        googleId: data.user?.googleId || "",
      });

      finishSocialAuth(data, "Signed in");
    } catch (err) {
      setError(err.message || "An error occurred during Google sign-in");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or could not be completed.");
  };

  const handleAppleSuccess = async (appleResponse) => {
    setError("");
    setSuccess("");
    setIsAppleLoading(true);

    try {
      const identityToken = appleResponse?.authorization?.id_token;

      if (!identityToken) {
        setError("Apple did not return a valid identity token. Please try again.");
        return;
      }

      const response = await fetch("/api/auth/apple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identityToken,
          user: appleResponse?.user,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Apple sign-in failed");
        return;
      }

      finishSocialAuth(data, "Signed in");
    } catch (err) {
      setError(err.message || "An error occurred during Apple sign-in");
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleAppleError = () => {
    setError("Apple sign-in was cancelled or could not be completed.");
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

              <div className="flex items-center gap-4 text-xs uppercase tracking-[0.35em] text-white/30">
                <span className="h-px flex-1 bg-white/10" />
                <span>or continue with</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
                  {googleClientId ? (
                    <GoogleLogoButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/50"
                    >
                      Google (set VITE_GOOGLE_CLIENT_ID)
                    </button>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
                  {appleClientId && appleRedirectUri ? (
                    <AppleSignin
                      authOptions={{
                        clientId: appleClientId,
                        scope: "email name",
                        redirectURI: appleRedirectUri,
                        usePopup: true,
                      }}
                      uiType="dark"
                      className="w-full"
                      noDefaultStyle={false}
                      buttonExtraChildren="Continue with Apple"
                      onSuccess={handleAppleSuccess}
                      onError={handleAppleError}
                    />
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/50"
                    >
                      Apple (set VITE_APPLE_CLIENT_ID + VITE_APPLE_REDIRECT_URI)
                    </button>
                  )}
                </div>
              </div>

              {(isGoogleLoading || isAppleLoading) && (
                <p className="text-xs text-center text-white/50">Completing social sign-in...</p>
              )}

              {selectedGoogleAccount?.email && (
                <p className="text-xs text-center text-white/55">
                  Selected Google account: {selectedGoogleAccount.email}
                  {selectedGoogleAccount.googleId ? ` (ID: ${selectedGoogleAccount.googleId})` : ""}
                </p>
              )}

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