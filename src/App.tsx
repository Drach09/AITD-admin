import { type ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";
import { checkAdminSession } from "@/lib/api";

const queryClient = new QueryClient();

const AUTH_STORAGE_KEY = "aitd-admin-authenticated";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem(AUTH_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    async function verify() {
      const res = await checkAdminSession();
      if (!res.authenticated) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthenticated(false);
      } else {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        setAuthenticated(true);
      }
      setChecking(false);
    }
    verify();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-white dark:bg-brand-black">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700 dark:text-slate-200" />
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Verifying session...</p>
      </div>
    );
  }

  return authenticated ? <>{children}</> : <Navigate to="/" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="aitd-admin-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
