"use client";
import { useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { SceneBackground } from "@/components/SceneBackground";
import Typewriter from "@/components/Typewriter";
import AuthForm from "@/components/AuthForm";

function Home() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination");

  useEffect(() => {
    if (status === "authenticated") router.push(destination ? `/dashboard?destination=${destination}` : "/dashboard");
  }, [status, router, destination]);

  if (status === "authenticated") return null;

  return (
    <div className="min-h-[calc(100vh-65px)] -mx-4 sm:-mx-6 relative flex flex-col items-center justify-center overflow-hidden py-12 gap-6">
      <SceneBackground scene="mountains" className="opacity-90" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(10,10,15,0.35) 0%, rgba(10,10,15,0.7) 100%)" }} />
      <Typewriter />
      <AuthForm initialMode="signin" destination={destination} />
    </div>
  );
}

export default function HomePageWrapper() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
