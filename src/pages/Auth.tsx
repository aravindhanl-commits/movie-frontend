import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film } from "lucide-react";
import { toast } from "sonner";
import { loginUser, registerUser } from "@/api/api";
import { useUser } from "../context/UserContext";
const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (token && role) {
      if (role === "admin") navigate("/admin");
      else navigate("/"); // user home
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await loginUser({ email, password });

      localStorage.setItem("token", res.token);
      localStorage.setItem("userRole", res.role);
      localStorage.setItem("userEmail", res.email);
      setUser({ id: res.id, name: res.userName, email: res.email});

      toast.success(`Welcome back, ${res.role === "admin" ? "Admin" : "User"}!`);

      if (res.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("register-name") as string;
    const email = formData.get("register-email") as string;
    const phone = formData.get("register-phone") as string;
    const password = formData.get("register-password") as string;

    try {
      await registerUser({ name, email, phone, password });

      toast.success("Account created successfully! Please login.");

      // After registration, switch to login tab
      const loginTab = document.querySelector('[data-value="login"]') as HTMLElement;
      loginTab?.click();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      <div className="container px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Film className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to CinemaBook</h1>
            <p className="text-muted-foreground">Sign in to book your tickets</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" placeholder="john@example.com" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" name="password" type="password" placeholder="••••••••" required className="mt-1" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input id="register-name" name="register-name" type="text" placeholder="John Doe" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" name="register-email" type="email" placeholder="john@example.com" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="register-phone">Phone</Label>
                  <Input id="register-phone" name="register-phone" type="tel" placeholder="+1 (555) 123-4567" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input id="register-password" name="register-password" type="password" placeholder="••••••••" required className="mt-1" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
