import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { clinic } from "@/config/clinic";
import { Logo } from "@/components/clinic/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import loginImage from "@/assets/clinic-login.jpg";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff Login — Shibui Dental Care" },
      {
        name: "description",
        content:
          "Secure staff sign-in for Shibui Dental Hub, Kharghar — appointments, patient records and digital prescriptions.",
      },
      { property: "og:title", content: "Staff Login — Shibui Dental Care" },
      {
        property: "og:description",
        content: "Internal clinic system for Shibui Dental Hub, Kharghar, Navi Mumbai.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Please enter your email address.");
    if (!password) return setError("Please enter your password.");
    setLoading(true);
    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      // Auto-confirm is enabled, so a session is returned immediately.
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError("Email or password is not correct. Please try again.");
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="relative min-h-screen w-full">
      <img
        src={loginImage}
        alt="Shibui Dental Hub clinic interior"
        width={1536}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-rose-deep/70" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/25 bg-card/92 p-7 shadow-lifted backdrop-blur-md sm:p-9">
          <div className="flex justify-center">
            <Logo />
          </div>

          <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight">
            {clinic.clinicName}
          </h1>
          <p className="mt-1 text-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {clinic.tagline}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reception@shibuidental.in"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={loading}>
              {loading ? "Signing in…" : "Login"}
            </Button>
          </form>

          <div className="gold-rule my-6" />

          <div className="space-y-1 text-center text-xs leading-relaxed text-muted-foreground">
            <p className="text-sm font-semibold text-foreground">{clinic.doctorName}</p>
            <p>{clinic.qualifications}</p>
            <p className="pt-2 font-medium text-foreground">Mon to Sat</p>
            <p>09:00 AM - 01:00 PM</p>
            <p>04:00 PM - 09:00 PM</p>
            <p className="pt-1">Sunday: By appointment only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
