import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Mail, Phone, User, Lock, Sparkles, Loader2, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { login, signUp, resetPassword, updatePassword } from "@/js/services/auth";
import { supabase } from "@/js/utils/supabaseClient";

const loginSchema = z.object({
  emailOrMobile: z.string().min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recovery (password reset) state
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [recoveryDone, setRecoveryDone] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Detect recovery event from Supabase password reset email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
    // Also check URL params
    if (searchParams.get("type") === "recovery") {
      setIsRecovery(true);
    }
    return () => subscription.unsubscribe();
  }, [searchParams]);

  const handleUpdatePassword = async () => {
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
      setRecoveryDone(true);
      toast.success("Password updated successfully!");
    } catch (error: any) {
      console.error("Password update failed:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [loginData, setLoginData] = useState<LoginFormData>({
    emailOrMobile: "",
    password: "",
  });

  const [signupData, setSignupData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const handleForgotPassword = async () => {
    if (!resetEmail.trim() || !resetEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setResetSending(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
      toast.success("Password reset link sent! Check your email.");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setResetSending(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginData.emailOrMobile, loginData.password);
      toast.success("Login successful! Welcome back.");
      navigate("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.message || "Failed to log in. Please check your credentials.");
      if (error.message?.includes("Invalid login")) {
        setErrors({ emailOrMobile: "Invalid email or password", password: "Invalid email or password" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(signupData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp(signupData.email, signupData.password, signupData.fullName, signupData.mobile);

      if (result.session) {
        toast.success("Account created and logged in! Welcome!");
        navigate("/");
      } else {
        toast.success("Account created! Please check your email to confirm, then log in.");
        setIsLogin(true);
        setLoginData(prev => ({ ...prev, emailOrMobile: signupData.email }));
      }

      setSignupData({
        fullName: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Signup failed:", error);
      const msg = error.message || "Failed to create account. Please try again.";
      toast.error(msg);
      if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("already registered")) {
        setErrors({ email: "This email is already registered. Try logging in instead." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow hero-gradient flex items-center justify-center py-12 px-4">
        {/* Decorative elements */}
        <div className="absolute top-32 left-10 w-20 h-20 rounded-full bg-primary/10 blur-2xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-secondary/10 blur-2xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="w-full max-w-md relative z-10">
          {/* Auth Card */}
          <div className="bg-card rounded-2xl shadow-card p-8 border border-border/50 backdrop-blur-sm">
            {/* ====== RECOVERY MODE — Set New Password ====== */}
            {isRecovery ? (
              <div className="text-center">
                {recoveryDone ? (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold font-display text-foreground mb-2">
                      Password Updated!
                    </h1>
                    <p className="text-muted-foreground mb-6">
                      Your password has been reset successfully. You can now log in with your new password.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => { setIsRecovery(false); setRecoveryDone(false); }}
                        className="w-full gradient-bg shadow-button hover:opacity-90"
                      >
                        Continue to Login
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-bg mb-4">
                      <KeyRound className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold font-display text-foreground mb-2">
                      Set New Password
                    </h1>
                    <p className="text-muted-foreground mb-6">
                      Enter your new password below.
                    </p>

                    <div className="space-y-4 text-left">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-foreground font-medium">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 bg-background border-input focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword" className="text-foreground font-medium">Confirm New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="confirmNewPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="pl-10 pr-10 h-12 bg-background border-input focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleUpdatePassword}
                        disabled={isSubmitting}
                        className="w-full h-12 gradient-bg text-primary-foreground font-semibold shadow-button hover:opacity-90 mt-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : "Update Password"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
            <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-bg mb-4">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold font-display text-foreground mb-2">
                {isLogin ? "Welcome Back" : "Join Us"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Sign in to access your account"
                  : "Create an account to start renting"}
              </p>
            </div>

            {/* ====== LOGIN FORM ====== */}
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="emailOrMobile" className="text-foreground font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="emailOrMobile"
                      type="email"
                      placeholder="Enter email"
                      value={loginData.emailOrMobile}
                      onChange={(e) => setLoginData({ ...loginData, emailOrMobile: e.target.value })}
                      className="pl-10 h-12 bg-background border-input focus:border-primary"
                    />
                  </div>
                  {errors.emailOrMobile && (
                    <p className="text-sm text-destructive">{errors.emailOrMobile}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-10 pr-10 h-12 bg-background border-input focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(loginData.emailOrMobile || "");
                      setResetSent(false);
                      setShowForgotPassword(true);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 gradient-bg text-primary-foreground font-semibold shadow-button hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : "Login"}
                </Button>
              </form>
            ) : (
              /* ====== SIGNUP FORM ====== */
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      className="pl-10 h-12 bg-background border-input focus:border-primary"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="pl-10 h-12 bg-background border-input focus:border-primary"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-foreground font-medium">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={signupData.mobile}
                      onChange={(e) => setSignupData({ ...signupData, mobile: e.target.value })}
                      className="pl-10 h-12 bg-background border-input focus:border-primary"
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-sm text-destructive">{errors.mobile}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword" className="text-foreground font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="pl-10 pr-10 h-12 bg-background border-input focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 h-12 bg-background border-input focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 gradient-bg text-primary-foreground font-semibold shadow-button hover:opacity-90 transition-opacity mt-2 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : "Create Account"}
                </Button>
              </form>
            )}

            {/* Toggle Link */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary font-semibold hover:underline"
                >
                  {isLogin ? "Sign up" : "Login"}
                </button>
              </p>
            </div>

            {/* Social Login — login only */}
            {isLogin && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground">or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 border-border hover:bg-muted/50"
                    onClick={() => toast.info("Google login coming soon!")}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 border-border hover:bg-muted/50"
                    onClick={() => toast.info("Facebook login coming soon!")}
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </>
            )}
            </>
            )}
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-3">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-xs text-muted-foreground">Secure Login</p>
            </div>
            <div className="p-3">
              <div className="text-2xl mb-1">👗</div>
              <p className="text-xs text-muted-foreground">1000+ Outfits</p>
            </div>
            <div className="p-3">
              <div className="text-2xl mb-1">🚚</div>
              <p className="text-xs text-muted-foreground">Free Delivery</p>
            </div>
          </div>
        </div>
      </main>

      {/* ====== FORGOT PASSWORD DIALOG ====== */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border/50 p-0 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-purple-600" />
          <div className="p-6 pt-4">
            <DialogHeader className="text-center mb-6">
              <div className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent mb-3">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-display font-bold">
                Reset Password
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                {resetSent
                  ? "Check your inbox for the reset link"
                  : "Enter your email and we'll send you a password reset link"}
              </DialogDescription>
            </DialogHeader>

            {resetSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to <strong className="text-foreground">{resetEmail}</strong>.
                  Please check your email (including spam folder).
                </p>
                <Button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                  }}
                  className="w-full gradient-bg text-primary-foreground font-semibold"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-foreground font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10 h-11 bg-background border-input focus:border-primary"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  onClick={handleForgotPassword}
                  disabled={resetSending}
                  className="w-full h-11 gradient-bg text-primary-foreground font-semibold shadow-button hover:opacity-90 transition-opacity"
                >
                  {resetSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : "Send Reset Link"}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to login
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Auth;