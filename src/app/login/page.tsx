"use client";
import { SceneBackground } from "@/components/SceneBackground";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-65px)] -mx-4 sm:-mx-6 relative flex items-center justify-center overflow-hidden py-16">
      <SceneBackground scene="temple" className="opacity-60" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, var(--paper) 0%, rgba(10,10,15,0.45) 55%, var(--paper) 100%)" }} />
      <AuthForm initialMode="signin" />
    </div>
  );
}
