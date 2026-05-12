"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PatientDetailsForm } from "./PatientDetailsForm";
import { PaymentMethodForm } from "./PaymentMethodForm";

import { useBookingStore } from "@/store/useBookingStore";

export function PaymentForm() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const setGeneratedToken = useBookingStore(state => state.setGeneratedToken);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call to POST /queue/token/online
    setTimeout(() => {
      const mockToken = {
        tokenNumber: Math.floor(Math.random() * 20) + 1,
        status: 'WAITING',
        source: 'ONLINE',
        estimatedWaitMinutes: 25
      };
      setGeneratedToken(mockToken);
      router.push("/confirmation");
    }, 2000);
  };

  return (
    <div className="flex-1 space-y-8">
      <PatientDetailsForm />
      <PaymentMethodForm isProcessing={isProcessing} handlePayment={handlePayment} />
    </div>
  );
}
