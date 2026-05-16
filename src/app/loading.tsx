export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        {/* Brand-consistent shimmer card */}
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-premium border border-slate-100 animate-pulse">
           <img src="/logo.png" alt="" className="w-12 h-12 object-contain" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xl font-black tracking-tight">
            <span className="text-primary">Jivni</span><span className="text-secondary">Care</span>
          </p>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Bihar</p>
        </div>
      </div>
    </div>
  );
}
