import { useState } from "react";

export default function Login() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		remember: true,
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

							<a href="/" className="font-medium text-[#1db954] transition hover:text-[#4ef08a]">
								Forgot password?
							</a>
						</div>

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

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
							{["Spotify", "Google", "Apple"].map((provider) => (
								<button
									key={provider}
									type="button"
									className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-[#1db954]/50 hover:bg-white/10"
								>
									{provider}
								</button>
							))}
						</div>

						<p className="pt-2 text-center text-sm text-white/55">
							New to TuneOn? <a href="/register" className="font-semibold text-[#1db954] hover:text-[#4ef08a]">Create an account</a>
						</p>
					</form>
				</section>
			</div>
		</main>
	);
}
