import React from "react";

interface TokenStatusDisplayProps {
  status: string;
  tokenNumber: number;
  position?: number | null; // how many people ahead
}

const STATUS_CONFIG: Record<
  string,
  { emoji: string; title: string; message: string; color: string }
> = {
  WAITING: {
    emoji: "🕐",
    title: "Aap queue mein hain",
    message: "Clinic pahunchne par reception ko apna token number bataayein.",
    color: "zinc",
  },
  AWAITING_ARRIVAL: {
    emoji: "📍",
    title: "Aapka arrival register ho gaya",
    message: "Kripya payment counter pe jaayein.",
    color: "blue",
  },
  PAYMENT_PENDING: {
    emoji: "💳",
    title: "Payment process ho rahi hai",
    message: "Reception aapka payment confirm kar raha hai. Thoda intezaar karein.",
    color: "yellow",
  },
  READY: {
    emoji: "✅",
    title: "Aap ready queue mein hain",
    message: "Doctor jald aapko bulaenge. Waiting area mein baithe rahein.",
    color: "green",
  },
  CALLED: {
    emoji: "🔔",
    title: "Doctor ne aapko bulaya!",
    message: "Kripya abhi doctor ke cabin mein jaayein.",
    color: "purple",
  },
  IN_CONSULTATION: {
    emoji: "🩺",
    title: "Consultation chal raha hai",
    message: "Aap abhi doctor ke saath hain.",
    color: "indigo",
  },
  COMPLETED: {
    emoji: "✓",
    title: "Consultation complete",
    message: "Aapka aaj ka visit complete ho gaya. Get well soon!",
    color: "green",
  },
  CANCELLED: {
    emoji: "✕",
    title: "Token cancel ho gaya",
    message: "Aapne is token ko cancel kar diya.",
    color: "zinc",
  },
  NO_SHOW: {
    emoji: "⚠",
    title: "No Show",
    message: "Is token pe koi action nahi hua.",
    color: "red",
  },
  EXPIRED: {
    emoji: "⏰",
    title: "Token expire ho gaya",
    message: "Is token ka time window khatam ho gaya. Dobara book karein.",
    color: "red",
  },
  SKIPPED: {
    emoji: "⏭",
    title: "Token skip hua",
    message: "Yeh token skip ho gaya. Reception se rabta karein.",
    color: "zinc",
  },
};

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  zinc: {
    bg: "bg-zinc-50 dark:bg-zinc-900",
    text: "text-zinc-700 dark:text-zinc-300",
    border: "border-zinc-200 dark:border-zinc-700",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
  },
};

export function TokenStatusDisplay({
  status,
  tokenNumber,
  position,
}: TokenStatusDisplayProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["WAITING"];
  const colors = COLOR_CLASSES[config.color] ?? COLOR_CLASSES["zinc"];

  return (
    <div
      className={`rounded-2xl border p-6 text-center ${colors.bg} ${colors.border}`}
    >
      <div className="text-4xl mb-3">{config.emoji}</div>
      <div className="text-3xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">
        #{tokenNumber}
      </div>
      <div className={`text-base font-semibold mb-2 ${colors.text}`}>
        {config.title}
      </div>
      <div className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {config.message}
      </div>
      {position != null && position > 0 && status === "WAITING" && (
        <div className="mt-3 text-sm text-zinc-500">
          Aapke aage{" "}
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {position}
          </span>{" "}
          {position === 1 ? "patient" : "patients"} hain
        </div>
      )}
    </div>
  );
}
