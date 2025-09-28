"use client";
import React, { useEffect, useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

const Signup = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentSignUp, setCurrentSignUp] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLoaded) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddress }),
      });

      const data = await res.json();

      if (data.exists) {
        setError("Email already exists. Please use another one.");
        return; 
      }

      const createdSignup = await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
        unsafeMetadata: { role },
      });

      setCurrentSignUp(createdSignup);

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (error: any) {
      console.log(JSON.stringify(error, null, 2));
      setError(error.errors?.[0]?.message || "Something went wrong");
    }
  }

  async function onPressVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const completeSignup =
        await currentSignUp.attemptEmailAddressVerification({
          code,
        });

      if (completeSignup.status === "complete") {
        await fetch("/api/users", {
          method: "POST",
          body: JSON.stringify({
            email: emailAddress,
            firstName,
            lastName,
            role,
          }),
          headers: { "Content-Type": "application/json" },
        });
        await setActive({ session: completeSignup.createdSessionId });
        router.push("/dashboard");
      } else {
        console.log(JSON.stringify(completeSignup, null, 2));
      }
    } catch (error: any) {
      console.log(JSON.stringify(error, null, 2));
      setError(error.errors[0]?.message || "Verification failed");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sign Up
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Select Role</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={role === "USER" ? "default" : "outline"}
                    onClick={() => setRole("USER")}
                    className="flex-1"
                  >
                    User
                  </Button>
                  <Button
                    type="button"
                    variant={role === "ADMIN" ? "default" : "outline"}
                    onClick={() => setRole("ADMIN")}
                    className="flex-1"
                  >
                    Admin
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {mounted && <div id="clerk-captcha" />}
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          ) : (
            <form onSubmit={onPressVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter verification code"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Verify Email
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
