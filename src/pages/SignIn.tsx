import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { SignalHigh, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../integrations/supabase/client";
import Logo from "../components/Logo";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Login successful",
        description: "You are now logged in.",
      });
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Login error",
        description: error.message || "Unable to sign in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email to reset your password.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email sent",
        description: "A reset email has been sent to your address.",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to send reset email.",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        throw error;
      }

      // Si l'inscription réussit, connecter automatiquement l'utilisateur
      if (data.user) {
        toast({
          title: "Registration successful",
          description: "Your account has been created and you are now logged in.",
        });
        setShowSignUp(false);
        window.location.href = "/";
      }
    } catch (error: any) {
      toast({
        title: "Registration error",
        description: error.message || "Unable to create account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Google login error",
        description: error.message || "Unable to sign in with Google.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Logo className="h-8 w-8 text-green-500" />
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">Real-time Trading</div>
              <div className="text-xl font-bold text-foreground">Signals</div>
            </div>
          </div>
        </div>

        {/* Sign In Card */}
        <Card className="bg-card border-border">
          <CardHeader className="text-center pb-4">
            <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
            <p className="text-sm text-muted-foreground">
              Not registered yet?{" "}
              <button 
                onClick={() => setShowSignUp(true)}
                className="text-blue-500 hover:underline"
              >
                Create Account
              </button>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email Input */}
              <div>
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 bg-background border-border"
                />
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  Password *
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 bg-background border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-muted-foreground hover:text-foreground border border-border px-2 py-1 rounded"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {/* OR Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">OR LOGIN WITH</span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              variant="outline"
              className="w-full bg-background border-border text-foreground hover:bg-accent"
              onClick={handleGoogleSignIn}
            >
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">G</span>
                </div>
                <span>Login with Google</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => window.location.href = "/"}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center space-x-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Modal Forgot Password */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reset-email" className="text-sm text-muted-foreground">
                  Email *
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleForgotPassword}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Send Reset Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sign Up */}
      {showSignUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new account to access trading signals.
            </p>
                         <form onSubmit={handleSignUp} className="space-y-4">
               <div>
                 <Label htmlFor="signup-fullname" className="text-sm text-muted-foreground">
                   Full Name *
                 </Label>
                 <Input
                   id="signup-fullname"
                   type="text"
                   value={fullName}
                   onChange={(e) => setFullName(e.target.value)}
                   placeholder="Enter your full name"
                   required
                   className="mt-1"
                 />
               </div>
               <div>
                 <Label htmlFor="signup-email" className="text-sm text-muted-foreground">
                   Email *
                 </Label>
                 <Input
                   id="signup-email"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="Enter your email"
                   required
                   className="mt-1"
                 />
               </div>
               <div>
                 <Label htmlFor="signup-password" className="text-sm text-muted-foreground">
                   Password *
                 </Label>
                 <div className="relative mt-1">
                   <Input
                     id="signup-password"
                     type={showSignUpPassword ? "text" : "password"}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="Enter your password"
                     required
                     className="pr-10"
                   />
                   <button
                     type="button"
                     onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                   >
                     {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                 </div>
               </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSignUp(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
