import { useState } from "react";
import { LuShieldCheck } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { loginAdmin, setStoredSession } from "../services/adminApi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await loginAdmin({
        email: email.trim(),
        password,
      });

      setStoredSession({
        token: response.token,
        user: response.user,
      });

      navigate("/admin/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.12)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden bg-[#163060] p-10 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(163,230,53,0.2),_transparent_45%)]" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-lime-200">
              <LuShieldCheck size={14} />
              Maven Admin
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight">
              Admin governance with live system control.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-200">
              Sign in with an Admin account to manage users, roles, permissions,
              and full-platform visibility from one dedicated workspace.
            </p>
            <div className="mt-10 grid gap-4">
              {[
                "Real-time KPI oversight",
                "Role and permission governance",
                "Cross-platform operational visibility",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-medium text-white/85"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Admin Access
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Sign in to Admin Panel
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              This app now connects to the Admin backend and only allows real
              Admin accounts to enter.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@mavenjobs.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#163060] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#163060] focus:bg-white"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#163060] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d3f7f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Continue to Admin Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
