import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data: cats } = await supabase.from('categories').select('id, name')
  console.log("CATEGORIES:")
  cats.forEach(c => console.log(`  ${c.id} → ${c.name}`))
  
  // Count products per category
  const { data: prods } = await supabase.from('products').select('id, category_id, name')
  const counts = {}
  prods.forEach(p => {
    const cat = cats.find(c => c.id === p.category_id)
    const catName = cat ? cat.name : 'Uncategorized'
    counts[catName] = (counts[catName] || 0) + 1
  })
  console.log("\nPRODUCTS PER CATEGORY:")
  Object.entries(counts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`))
}
test()
