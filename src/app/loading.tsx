export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        {/* Brand-consistent shimmer card */}
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
          <svg
            className="w-8 h-8 text-primary animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-bold text-slate-700">JivniCare</p>
          <p className="text-xs text-slate-400 font-medium">Loading your healthcare platform…</p>
        </div>
      </div>
    </div>
  );
}
