"use client";

import { useState } from "react";
import { Lock, ArrowRight, CreditCard, Apple, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const INPUT_CLASS = "h-14 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#205E98] text-base shadow-sm";

interface PaymentMethodFormProps {
  isProcessing: boolean;
  handlePayment: (e: React.FormEvent) => void;
}

export function PaymentMethodForm({ isProcessing, handlePayment }: PaymentMethodFormProps) {
  const [focused, setFocused] = useState<string | null>(null);

  const focusProps = (name: string) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
  });

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payment Details</h2>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Step 2 of 2</span>
      </div>

      <form onSubmit={handlePayment}>
        <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden bg-white/60 backdrop-blur-xl">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-500 mb-4 text-center">EXPRESS CHECKOUT</p>
            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline" className="h-12 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold shadow-sm">
                <div className="relative h-5 w-12">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Pay_Logo_%282020%29.svg" alt="GPay" fill className="object-contain" />
                </div>
              </Button>
              <Button type="button" variant="outline" className="h-12 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold shadow-sm">
                <Apple className="w-5 h-5 mr-2" /> Pay
              </Button>
            </div>

            <div className="relative flex items-center py-6">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Or pay with card</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <div className="space-y-5">
              <div className={`transition-transform duration-300 ${focused === "card" ? "scale-[1.01]" : ""}`}>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input placeholder="0000 0000 0000 0000" className={`${INPUT_CLASS} pl-12 font-mono`} {...focusProps("card")} />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-8 h-5 bg-slate-200 rounded text-[8px] flex items-center justify-center font-bold text-slate-500">VISA</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className={`transition-transform duration-300 ${focused === "exp" ? "scale-[1.01]" : ""}`}>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Expiry Date</label>
                  <Input placeholder="MM/YY" className={`${INPUT_CLASS} font-mono text-center`} {...focusProps("exp")} />
                </div>
                <div className={`transition-transform duration-300 ${focused === "cvv" ? "scale-[1.01]" : ""}`}>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">CVV</label>
                  <div className="relative">
                    <Input type="password" placeholder="123" maxLength={3} className={`${INPUT_CLASS} font-mono text-center tracking-[0.3em]`} {...focusProps("cvv")} />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          disabled={isProcessing}
          className="w-full h-16 mt-8 rounded-2xl bg-[#205E98] hover:bg-[#184a7a] shadow-xl shadow-[#205E98]/20 transition-all hover:scale-[1.02] text-lg font-bold group disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed overflow-hidden relative"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Payment...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Confirm & Pay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>

        <p className="text-center text-sm text-slate-500 mt-6 font-medium flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure SSL processing via Stripe
        </p>
      </form>
    </section>
  );
}
