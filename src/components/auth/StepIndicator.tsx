"use client";

import { motion } from "framer-motion";
import { Check, Phone, KeyRound, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type OnboardingStep = "phone" | "otp" | "identity";

interface StepIndicatorProps {
  currentStep: OnboardingStep;
  isNewUser?: boolean;
}

const steps = [
  { id: "phone", label: "Phone", icon: Phone },
  { id: "otp", label: "Verify", icon: KeyRound },
  { id: "identity", label: "Profile", icon: User },
] as const;

export function StepIndicator({ currentStep, isNewUser = true }: StepIndicatorProps) {
  const displayedSteps = isNewUser ? steps : steps.slice(0, 2);
  const currentIndex = displayedSteps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" role="navigation" aria-label="Onboarding progress">
      {displayedSteps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1 : 0.9,
                  backgroundColor: isCompleted
                    ? "rgb(34 197 94)"
                    : isCurrent
                    ? "rgb(32 94 152)"
                    : "rgb(241 245 249)",
                }}
                className={cn(
                  "relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-shadow",
                  isCurrent && "shadow-lg shadow-primary/20 ring-4 ring-primary/10",
                  isCompleted && "shadow-md shadow-green-500/20"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  </motion.div>
                ) : (
                  <Icon
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5",
                      isCurrent ? "text-white" : "text-slate-400"
                    )}
                    aria-hidden="true"
                  />
                )}
              </motion.div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-semibold tracking-wide transition-colors",
                  isCurrent ? "text-primary" : isCompleted ? "text-green-600" : "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < displayedSteps.length - 1 && (
              <div className="mx-2 sm:mx-4 h-[2px] w-8 sm:w-12 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: index < currentIndex ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full bg-green-500"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
