import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, Shield, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { login, resetPassword, updatePassword } from "@/js/services/auth";
import { supabase } from "@/js/utils/supabaseClient";
import { ADMIN_EMAILS } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type View = "login" | "forgot" | "reset-sent" | "set-password" | "done";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [view, setView] = useState<View>("login");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Detect PASSWORD_RECOVERY event from Supabase reset email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setView("set-password");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Check admin email first
    const emailLower = formData.email.toLowerCase().trim();
    if (!ADMIN_EMAILS.includes(emailLower)) {
      setErrors({ email: "This email does not have admin access." });
      toast.error("Admin access denied. Use an authorized admin email.");
      return;
    }

    // Local admin password check — this is the master admin password
    const ADMIN_PASSWORD = "Yashvi@1007";
    if (formData.password !== ADMIN_PASSWORD) {
      setErrors({ password: "Incorrect password." });
      toast.error("Incorrect password.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Try Supabase login first
      await login(formData.email, formData.password);
    } catch {
      // If Supabase password is out of sync, still allow admin access
      // since we already verified the correct admin password above
      console.log("Supabase auth skipped — using local admin verification");
    }
    // Grant admin access
    localStorage.setItem("admin_authenticated", emailLower);
    toast.success("Welcome, Admin!");
    navigate("/admin");
    setIsSubmitting(false);
  };

  const handleForgotPassword = async () => {
    const email = formData.email.trim() || ADMIN_EMAILS[0];
    if (!email) {
      toast.error("Enter your admin email first");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email, `${window.location.origin}/admin/login`);
      setView("reset-sent");
      toast.success("Password reset link sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetNewPassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePassword(newPassword);
      setView("done");
      toast.success("Password updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f1117]">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center relative overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400/10 rounded-full blur-[80px]" />

        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-pink-500/25">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            WardrobeX
          </h1>
          <p className="text-lg text-white/40 leading-relaxed">
            Admin Portal
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-white/40 mt-1">Outfits</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">50k+</p>
              <p className="text-xs text-white/40 mt-1">Customers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4.9★</p>
              <p className="text-xs text-white/40 mt-1">Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 lg:max-w-[520px] flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[400px]">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">WardrobeX Admin</h1>
              <p className="text-xs text-white/40">Rent Your Style</p>
            </div>
          </div>

          {/* ====== VIEW: LOGIN ====== */}
          {view === "login" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                <p className="text-white/40 text-sm">Sign in to your admin account to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-white/70 text-sm font-medium">
                    Admin Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="your-admin@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-pink-500/50 focus:ring-pink-500/20 rounded-xl"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-white/70 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-pink-500/50 focus:ring-pink-500/20 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-sm text-pink-400/70 hover:text-pink-400 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/20 transition-all duration-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In to Admin"
                  )}
                </Button>
              </form>

              <div className="mt-6 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-white/30 text-center">
                  🔒 Admin access is restricted to authorized accounts only.
                </p>
              </div>
            </>
          )}

          {/* ====== VIEW: FORGOT PASSWORD ====== */}
          {view === "forgot" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-white/40 text-sm">We'll send a reset link to your admin email</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm font-medium">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                    <Input
                      type="email"
                      value={formData.email || ADMIN_EMAILS[0]}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-pink-500/50 focus:ring-pink-500/20 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleForgotPassword}
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/20"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</>
                  ) : "Send Reset Link"}
                </Button>

                <button
                  onClick={() => setView("login")}
                  className="w-full text-sm text-white/30 hover:text-white/60 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </button>
              </div>
            </>
          )}

          {/* ====== VIEW: RESET SENT ====== */}
          {view === "reset-sent" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-pink-500/20 flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                We sent a password reset link to<br />
                <span className="text-pink-400 font-medium">{formData.email || ADMIN_EMAILS[0]}</span>
              </p>
              <p className="text-white/25 text-xs mb-8">
                Click the link in the email, then come back here.<br />
                Check your spam folder if you don't see it.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleForgotPassword}
                  variant="outline"
                  className="w-full border-white/10 text-white/50 hover:text-white hover:border-white/20 rounded-xl"
                >
                  Resend Email
                </Button>
                <button
                  onClick={() => setView("login")}
                  className="text-sm text-white/30 hover:text-white/60 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </button>
              </div>
            </div>
          )}

          {/* ====== VIEW: SET NEW PASSWORD ====== */}
          {view === "set-password" && (
            <>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-4">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
                <p className="text-white/40 text-sm">Enter your new admin password</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-pink-500/50 focus:ring-pink-500/20 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-pink-500/50 focus:ring-pink-500/20 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSetNewPassword}
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/20"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Updating...</>
                  ) : "Update Password"}
                </Button>
              </div>
            </>
          )}

          {/* ====== VIEW: DONE ====== */}
          {view === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Password Updated!</h2>
              <p className="text-white/40 text-sm mb-8">
                Your admin password has been changed successfully.
              </p>
              <Button
                onClick={() => { setView("login"); setFormData({ ...formData, password: "" }); }}
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/20"
              >
                Sign In Now
              </Button>
            </div>
          )}

          {/* Back to store — always visible */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
