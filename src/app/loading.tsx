import { LoadingBrand } from "@/features/marketing/components/brand/LoadingBrand";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <LoadingBrand className="animate-pulse duration-1000" iconClassName="w-16 h-16" />
    </div>
  );
}
