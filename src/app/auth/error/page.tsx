"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Logo } from "@/features/marketing/components/brand/Logo";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  // Map NextAuth error codes to user-friendly messages
  let title = "Authentication Error";
  let message = "An unexpected error occurred during authentication. Please try again.";

  if (error === "Configuration") {
    title = "System Config Error";
    message = "There is a configuration issue with the authentication server. Please contact the administrator.";
  } else if (error === "AccessDenied") {
    title = "Access Denied";
    message = "You do not have permission to access this resource or sign in with this account.";
  } else if (error === "Verification") {
    title = "Verification Link Expired";
    message = "The authentication link has expired or has already been used. Please request a new one.";
  }

  return (
    <Card className="max-w-md w-full shadow-2xl rounded-[2.5rem] border-none bg-white overflow-hidden relative fade-in">
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#5696C7] to-[#529C60]" />
      
      <CardHeader className="text-center pt-10 pb-4 px-6 md:px-8">
        <div className="mx-auto h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 border border-rose-100 shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">{title}</CardTitle>
        <CardDescription className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
          {message}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 md:px-8 pb-6">
        <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-4 text-xs text-slate-500 font-medium space-y-2">
          <p className="font-bold text-slate-700">ErrorCode: {error || "Default"}</p>
          <p>If you believe this is an error, please verify your network connection and try signing in again.</p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 px-6 md:px-8 pb-10">
        <Button
          onClick={() => router.push("/partners/login")}
          className="w-full bg-[#5696C7] hover:bg-[#1a4d7d] text-white font-bold rounded-xl py-6 flex items-center justify-center gap-2 shadow-lg shadow-sky-900/10 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Sign In
        </Button>

        <Link href="tel:8235351897" className="w-full">
          <Button
            variant="outline"
            className="w-full border-slate-200 text-slate-650 hover:bg-slate-50 font-bold rounded-xl py-6 flex items-center justify-center gap-2 transition-all text-sm"
          >
            <LifeBuoy className="w-4 h-4 text-slate-400" /> Contact JivniCare Support
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
      
      {/* Floating abstract blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#5696C7]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#529C60]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100">
          <Logo className="w-6 h-6" />
        </div>
        <span className="text-xl font-black tracking-tight leading-none">
          <span style={{ color: '#5696C7' }}>Jivni</span><span style={{ color: '#529C60' }}>Care</span>
        </span>
      </div>

      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-2xl flex flex-col items-center justify-center">
            <span className="w-8 h-8 border-3 border-[#5696C7]/30 border-t-[#5696C7] rounded-full animate-spin"></span>
            <p className="text-slate-500 font-bold mt-4 text-sm">Verifying error status...</p>
          </div>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
