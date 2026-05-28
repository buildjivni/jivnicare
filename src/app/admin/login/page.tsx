"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BrandColors = { blue: "#5298D2", green: "#489C66" };

import { useAuthStore } from "@/features/auth/store/useAuthStore";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      login(data.user, data.token);
      router.push("/admin/dashboard");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl flex overflow-hidden fade-in min-h-[600px]">
        {/* Left Side - Branding */}
        <div className="w-1/2 bg-gradient-to-br from-[#1E3A8A] via-[#5298D2] to-[#489C66] p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                 <img src="/logo.png" alt="JivniCare Logo" className="w-8 h-8 object-contain" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white leading-none">
                Jivni<span className="text-[#489C66]">Care</span>
              </h2>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mt-10">
              Command <br />Center
            </h1>
            <p className="text-blue-100 font-medium mt-4 text-lg max-w-sm">
              Secure operational portal for JivniCare administrators.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Secure Access Only</p>
                <p className="text-blue-100 text-sm">All login attempts are monitored and logged.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-12 lg:p-20 flex flex-col justify-center bg-white relative">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-10 text-center md:text-left flex flex-col items-center md:items-start">
              <img src="/logo.png" alt="JivniCare Logo" className="w-16 h-16 object-contain mb-4 md:hidden" />
              <h2 className="text-3xl font-black text-slate-900">Admin Login</h2>
              <p className="text-slate-500 font-medium mt-2">Enter your credentials to access the dashboard.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Admin Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <Input 
                    type="email" 
                    required
                    placeholder="admin@jivnicare.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#5298D2] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <Input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#5298D2] font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-[#5298D2] border-slate-300 focus:ring-[#5298D2]" />
                  <span className="text-sm font-medium text-slate-600">Remember me</span>
                </label>
                <button type="button" className="text-sm font-bold text-[#5298D2] hover:underline">Forgot password?</button>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#5298D2] text-white font-black text-lg shadow-xl shadow-blue-900/20 hover:shadow-blue-900/40 transition-all flex items-center justify-center group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Access Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
