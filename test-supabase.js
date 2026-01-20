const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from("products").select("*, product_variants(*)");
  if (error) {
    console.log("ERROR:", error.message, error.code);
    const { data: p2, error: e2 } = await supabase.from("products").select("*");
    if (e2) console.log("PRODUCTS ERROR:", e2.message);
    else console.log("PRODUCTS OK, count:", p2.length);
  } else {
    console.log("BOTH OK");
  }
}
test();
