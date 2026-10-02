import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data } = await supabase.from('categories').select('id, name')
  console.log("Categories:", JSON.stringify(data, null, 2))

  const { data: prods } = await supabase.from('products').select('id, name, sku, barcode, category_id, material').order('created_at', { ascending: true })
  console.log("\nTotal products:", prods.length)
  prods.forEach((p, i) => {
    console.log(`  [${i+1}] ${p.name.substring(0, 50)} | cat: ${p.category_id || 'null'} | mat: ${p.material || 'null'}`)
  })
}
test()
