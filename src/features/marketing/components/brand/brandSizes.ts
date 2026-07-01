export const BRAND_SIZES = {
  header: {
    mobile: "h-8 max-h-[32px] w-auto", // 32px height provides high visibility while respecting ≤50% limit of the 64px header.
    desktop: "md:h-10 md:max-h-[40px] lg:h-10 lg:max-h-[40px]" // 40px height provides 50% height vertical alignment on 80px desktop header.
  },
  footer: {
    logo: "h-8 max-h-[32px] w-auto",
  },
  sidebar: {
    desktop: "h-6 max-h-[24px] w-auto",
    mobile: "h-5 max-h-[20px] w-auto",
    mobileAdmin: "h-[18px] max-h-[18px] w-auto"
  },
  auth: {
    icon: "h-8 max-h-[32px] w-auto",
    wordmark: "h-6 max-h-[24px] w-auto"
  },
  loading: {
    icon: "w-16 h-16 max-w-[64px] max-h-[64px]" // Small, tasteful 64px loading branding.
  }
} as const;
