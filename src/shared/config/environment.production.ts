// Production environment configuration
// Used when running: npm run build / npm start (NODE_ENV=production)

const environmentProduction = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // rzp_live_ key set in Hostinger env vars
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL!, // e.g. https://shrikalahasti.com
    name: "Shri Kalahasti Kalamkari",
  },
  isDevelopment: false,
  isProduction: true,
};

export default environmentProduction;
