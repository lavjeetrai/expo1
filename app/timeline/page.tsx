"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TimelineRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page where the timeline is actually integrated
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-white">
      <p>Redirecting to timeline...</p>
    </div>
  );
}
