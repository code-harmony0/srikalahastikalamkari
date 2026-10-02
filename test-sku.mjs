import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase.from('products').select('id, name, sku, barcode').limit(10)
  if (error) console.error("Error:", error)
  else {
    console.log("Products with SKU/Barcode:")
    data.forEach(p => console.log(`  ${p.name} → SKU: ${p.sku || '(empty)'} | Barcode: ${p.barcode || '(empty)'}`))
  }
}
test()
