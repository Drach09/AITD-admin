import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User } from "lucide-react";
import { toast } from "sonner";

const ADMIN_USERNAME = "aitd_admin_2026";
const ADMIN_PASSWORD = "2026AITD123";
const AUTH_STORAGE_KEY = "aitd-admin-authenticated";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem(AUTH_STORAGE_KEY) === "true") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      toast.error("Invalid admin credentials.");
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    toast.success("Login successful. Welcome back!");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-white dark:bg-brand-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-950/90">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">Admin Login</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Sign in with your admin credentials to access the dashboard.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                <div className="relative">
                  <Input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="aitd_admin_2026"
                    autoComplete="username"
                    className="pr-10"
                  />
                  <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="pr-10"
                />
              </div>

              <div>
                <Button type="submit" className="w-full">
                  Sign in
                </Button>
              </div>
            </form>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <p className="font-medium text-slate-900 dark:text-slate-100">Admin credentials</p>
              <p>Username: <span className="font-semibold">aitd_admin_2026</span></p>
              <p>Password: <span className="font-semibold">2026AITD123</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
