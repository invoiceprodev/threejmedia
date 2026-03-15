import { LoaderCircle } from "lucide-react";
import { usePageSeo } from "@/hooks/use-page-seo";

export default function AuthCallbackPage() {
  usePageSeo({
    title: "Signing In | Three J Media",
    description: "Secure authentication callback for Three J Media accounts.",
    path: "/auth/callback",
    robots: "noindex, nofollow",
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#83c406]" />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Signing you in</h1>
        <p className="mt-3 text-sm text-gray-300">We’re completing your secure sign-in and preparing your dashboard.</p>
      </div>
    </div>
  );
}
