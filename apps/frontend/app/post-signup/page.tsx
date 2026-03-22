"use client";

import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function PostSignupPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const hasCalled = useRef(false);

  useEffect(() => {
    // Wait until Clerk has loaded the user session
    if (!isLoaded || !user || hasCalled.current) return;

    const registerUser = async () => {
      hasCalled.current = true;
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        const token = await getToken();

        const email =
          user.primaryEmailAddress?.emailAddress ?? "";
        const name =
          user.fullName ?? user.username ?? email.split("@")[0] ?? "";

        await axios.post(
          `${API_BASE_URL}/add-user`,
          { email, name },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        // Non-blocking: log the error but still redirect to dashboard
        console.error("Failed to register user in backend:", error);
      } finally {
        router.replace("/dashboard");
      }
    };

    registerUser();
  }, [isLoaded, user, getToken, router]);

  // Loading screen while we register the user
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
        <p className="text-sm font-medium">Setting up your account…</p>
      </div>
    </div>
  );
}
