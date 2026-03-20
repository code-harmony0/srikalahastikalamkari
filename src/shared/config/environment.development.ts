// Development environment configuration
// Used when running: npm run dev (NODE_ENV=development)

const environmentDevelopment = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // use rzp_test_ key in .env.local for dev
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    name: "Shri Kalahasti Kalamkari (Dev)",
  },
  isDevelopment: true,
  isProduction: false,
};

export default environmentDevelopment;
