"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
  error = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Focus next empty or current input when value changes externally
  useEffect(() => {
    if (value.length < length && inputRefs.current[value.length]) {
      inputRefs.current[value.length]?.focus();
    }
  }, [value.length, length]);

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      // Handle paste of full OTP
      if (inputValue.length > 1) {
        const digits = inputValue.replace(/\D/g, "").slice(0, length);
        onChange(digits);
        if (digits.length === length && inputRefs.current[length - 1]) {
          inputRefs.current[length - 1]?.focus();
        }
        return;
      }

      const digit = inputValue.replace(/\D/g, "");
      const newValue = value.split("");
      newValue[index] = digit;
      const joined = newValue.join("").slice(0, length);
      onChange(joined);

      // Move to next input
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, onChange, length]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const newValue = value.split("");
        
        if (newValue[index]) {
          // Clear current digit
          newValue[index] = "";
          onChange(newValue.join(""));
        } else if (index > 0) {
          // Move to previous and clear
          newValue[index - 1] = "";
          onChange(newValue.join(""));
          inputRefs.current[index - 1]?.focus();
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, onChange, length]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      onChange(pasted);
      if (pasted.length === length) {
        inputRefs.current[length - 1]?.focus();
      } else if (pasted.length > 0) {
        inputRefs.current[pasted.length]?.focus();
      }
    },
    [onChange, length]
  );

  return (
    <div 
      className="flex justify-center gap-2 sm:gap-3" 
      role="group" 
      aria-label="Enter verification code"
    >
      {Array.from({ length }).map((_, index) => {
        const hasValue = value[index] !== undefined && value[index] !== "";
        const isFocused = focusedIndex === index;

        return (
          <motion.div
            key={index}
            initial={false}
            animate={{
              scale: hasValue ? 1.02 : 1,
              y: error && hasValue ? [0, -3, 3, -3, 3, 0] : 0,
            }}
            transition={
              error
                ? { duration: 0.35, ease: [0.36, 0.07, 0.19, 0.97] }
                : { type: "spring", stiffness: 500, damping: 30 }
            }
          >
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={value[index] || ""}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              disabled={disabled}
              aria-label={`Digit ${index + 1} of ${length}`}
              className={cn(
                // Base styles with premium transitions
                "h-14 w-11 sm:h-16 sm:w-14 rounded-xl border-2 bg-white text-center text-2xl sm:text-3xl font-bold",
                "transition-[border-color,box-shadow,transform,background-color] duration-200 ease-out",
                "focus:outline-none focus:ring-4",
                // Touch responsiveness
                "active:scale-[0.98]",
                // Disabled state with subtle fade
                disabled && "cursor-not-allowed bg-slate-50/80 opacity-50 pointer-events-none",
                // Error state with emphasis
                error
                  ? "border-red-400 text-red-600 bg-red-50/30 focus:border-red-500 focus:ring-red-100"
                  : hasValue
                  ? "border-primary text-slate-900 shadow-sm shadow-primary/10 focus:border-primary focus:ring-primary/20"
                  : isFocused
                  ? "border-primary/70 bg-primary/[0.02] focus:border-primary focus:ring-primary/20"
                  : "border-slate-200 text-slate-900 hover:border-slate-300 focus:border-primary focus:ring-primary/20"
              )}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
