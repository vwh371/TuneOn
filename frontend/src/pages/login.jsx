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

export default function Login() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		remember: true,
	});

	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [isAppleLoading, setIsAppleLoading] = useState(false);
	const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);
	const [showForgotPassword, setShowForgotPassword] = useState(false);
	const [forgotForm, setForgotForm] = useState({ emailOrId: "" });
	const [forgotLoading, setForgotLoading] = useState(false);
	const [forgotSuccess, setForgotSuccess] = useState("");
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

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: formData.email,
					password: formData.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Login failed");
				return;
			}

			// Store token and user info
			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data.user));
			setSuccess(`Welcome back, ${data.user.name}!`);

			// Redirect after success
			setTimeout(() => {
				window.location.href = "/home";
			}, 1500);
		} catch (err) {
			setError(err.message || "An error occurred during login");
		} finally {
			setIsLoading(false);
		}
	};

	const finishLogin = (data, welcomePrefix = "Welcome back") => {
		localStorage.setItem("token", data.token);
		localStorage.setItem("user", JSON.stringify(data.user));
		setSuccess(`${welcomePrefix}, ${data.user.name}!`);

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

			finishLogin(data, "Signed in");
		} catch (err) {
			setError(err.message || "An error occurred during Google sign-in");
		} finally {
			setIsGoogleLoading(false);
		}
	};

	const handleForgotInputChange = (event) => {
		setForgotForm({ emailOrId: event.target.value });
	};

	const handleForgotSubmit = async (event) => {
		event?.preventDefault();
		setError("");
		setForgotSuccess("");
		setForgotLoading(true);

		try {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ emailOrId: forgotForm.emailOrId.trim() }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Could not send reset email");
				return;
			}

			setForgotSuccess(data.message || "If an account exists, a reset email has been sent.");
		} catch (err) {
			setError(err.message || "Could not send reset email");
		} finally {
			setForgotLoading(false);
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

			finishLogin(data, "Signed in");
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
		<main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(29,185,84,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_28%),linear-gradient(135deg,#07110a_0%,#0b1610_45%,#08110d_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
			<div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
				<section className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/8 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10 lg:p-12">
					<div className="absolute -left-20 top-12 h-56 w-56 rounded-full bg-[#1db954]/30 blur-3xl" />
					<div className="absolute -right-16 bottom-4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
					<div className="relative flex items-start gap-6">
						<div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#1db954] via-emerald-400 to-lime-300 shadow-[0_0_60px_rgba(29,185,84,0.45)] sm:h-28 sm:w-28">
							<div className="h-10 w-10 rounded-full border-10 border-black/70" />
						</div>

						<div className="max-w-xl">
							<p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#1db954]">TuneOn</p>
							<h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
								Sign in to keep the music flowing.
							</h1>
							<p className="mt-4 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
								Jump back into your playlists, discover fresh drops, and keep every mix on repeat with the TuneOn experience.
							</p>
						</div>
					</div>

					<div className="relative mt-10 grid gap-4 sm:grid-cols-3">
						{[
							{ label: "Daily mix", value: "42 tracks" },
							{ label: "Vibe", value: "Late-night" },
							{ label: "Quality", value: "HD streaming" },
						].map((item) => (
							<div
								key={item.label}
								className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur"
							>
								<p className="text-xs uppercase tracking-[0.3em] text-white/45">{item.label}</p>
								<p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
							</div>
						))}
					</div>
				</section>

				<section className="rounded-4xl border border-white/10 bg-[#0c120f]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8 lg:p-10">
					<div className="flex items-center gap-3">
						<span className="h-3 w-3 rounded-full bg-[#1db954] shadow-[0_0_18px_rgba(29,185,84,0.7)]" />
						<span className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">TuneOn</span>
					</div>

					<div className="mt-8">
						<h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
						<p className="mt-2 text-sm leading-6 text-white/65">
							Log in to your account and pick up where your sound left off.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="mt-8 space-y-5">
						<label className="block space-y-2">
							<span className="text-sm font-medium text-white/80">Email or username</span>
							<input
								type="text"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="name@tuneon.com"
								autoComplete="username"
								className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#1db954] focus:bg-white/8 focus:ring-4 focus:ring-[#1db954]/20"
							/>
						</label>

						<label className="block space-y-2">
							<span className="text-sm font-medium text-white/80">Password</span>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="••••••••"
								autoComplete="current-password"
								className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#1db954] focus:bg-white/8 focus:ring-4 focus:ring-[#1db954]/20"
							/>
						</label>

						<div className="flex flex-col gap-3 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
							<label className="flex items-center gap-3">
								<input
									type="checkbox"
									name="remember"
									checked={formData.remember}
									onChange={handleChange}
									className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#1db954] accent-[#1db954] focus:ring-[#1db954]"
								/>
								<span>Remember me</span>
							</label>

							<button
								type="button"
								onClick={() => {
									setShowForgotPassword((current) => !current);
									setError("");
									setForgotSuccess("");
								}}
								className="font-medium text-[#1db954] transition hover:text-[#4ef08a]"
							>
								Forgot password?
							</button>
						</div>

						{showForgotPassword && (
							<div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-white/45">Reset password</p>
								<label className="block space-y-2">
									<span className="text-sm text-white/80">Google ID or email</span>
									<input
										type="text"
										name="emailOrId"
										value={forgotForm.emailOrId}
										onChange={handleForgotInputChange}
										placeholder="name@gmail.com or Google ID"
										className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#1db954] focus:bg-white/8 focus:ring-4 focus:ring-[#1db954]/20"
									/>
								</label>

								<button
									type="button"
									onClick={handleForgotSubmit}
									disabled={forgotLoading}
									className="w-full rounded-full border border-white/20 bg-black/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#1db954]/60 hover:text-[#9bf8be] disabled:cursor-not-allowed disabled:opacity-60"
								>
									{forgotLoading ? "Sending reset email..." : "Send reset email"}
								</button>

								{forgotSuccess && <p className="text-xs text-emerald-300/90">{forgotSuccess}</p>}
							</div>
						)}

						{error && <p className="rounded-lg bg-red-900/20 border border-red-500/30 px-4 py-3 text-sm text-red-300">{error}</p>}

						{success && <p className="rounded-lg bg-green-900/20 border border-green-500/30 px-4 py-3 text-sm text-green-300">{success}</p>}

						<button
							type="submit"
							disabled={isLoading}
							className="group flex w-full items-center justify-center rounded-full bg-[#1db954] px-5 py-3.5 text-sm font-bold text-black shadow-[0_18px_40px_rgba(29,185,84,0.3)] transition hover:-translate-y-0.5 hover:bg-[#29d15f] hover:shadow-[0_22px_48px_rgba(29,185,84,0.4)] focus:outline-none focus:ring-4 focus:ring-[#1db954]/25 disabled:opacity-60 disabled:cursor-not-allowed"
						>
							<span className="transition group-hover:tracking-[0.08em]">{isLoading ? "Signing in..." : "Log in"}</span>
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

						<p className="pt-2 text-center text-sm text-white/55">
							New to TuneOn? <a href="/register" className="font-semibold text-[#1db954] hover:text-[#4ef08a]">Create an account</a>
						</p>
					</form>
				</section>
			</div>
		</main>
	);
}
