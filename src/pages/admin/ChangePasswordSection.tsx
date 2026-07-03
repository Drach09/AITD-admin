import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SectionCard } from "@/components/admin/SectionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changeAdminPassword } from "@/lib/api";

export function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password strength checks
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setChecks({
      length: newPassword.length >= 12,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^a-zA-Z0-9\s]/.test(newPassword),
    });
  }, [newPassword]);

  const metCount = Object.values(checks).filter(Boolean).length;
  
  const getStrengthText = () => {
    if (newPassword.length === 0) return "";
    if (metCount <= 2) return "Weak";
    if (metCount <= 4) return "Medium";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (metCount <= 2) return "bg-red-500";
    if (metCount <= 4) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (metCount < 5) {
      toast.error("New password does not meet the minimum security requirements.");
      return;
    }

    setLoading(true);
    try {
      const result = await changeAdminPassword(currentPassword, newPassword, confirmPassword);
      toast.success(result.message || "Password changed successfully!");
      
      // Destroy local session state and redirect to login
      localStorage.removeItem("aitd-admin-authenticated");
      
      // Delay navigation slightly so toast is readable
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard 
      title="Change Password" 
      description="Update your administrator login credentials securely. This will sign out all active sessions."
      icon={<KeyRound className="h-5 w-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Current Password
          </label>
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="pr-10"
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              disabled={loading}
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            New Password
          </label>
          <div className="relative">
            <Input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="pr-10"
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              disabled={loading}
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength Indicator Bar */}
          {newPassword && (
            <div className="space-y-2 mt-2 transition-all duration-300">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {getStrengthText()}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStrengthColor()} transition-all duration-500`}
                  style={{ width: `${(metCount / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm New Password
          </label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="pr-10"
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              disabled={loading}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Strength Checklist */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Password Security Requirements
          </h4>
          <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              {checks.length ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-400" />}
              At least 12 characters long
            </li>
            <li className="flex items-center gap-2">
              {checks.uppercase ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-400" />}
              At least one uppercase letter (A-Z)
            </li>
            <li className="flex items-center gap-2">
              {checks.lowercase ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-400" />}
              At least one lowercase letter (a-z)
            </li>
            <li className="flex items-center gap-2">
              {checks.number ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-400" />}
              At least one number (0-9)
            </li>
            <li className="flex items-center gap-2">
              {checks.special ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-400" />}
              At least one special character (e.g. @, #, $, %)
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full sm:w-auto min-w-[150px]" 
            disabled={loading || metCount < 5 || !currentPassword || newPassword !== confirmPassword}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
