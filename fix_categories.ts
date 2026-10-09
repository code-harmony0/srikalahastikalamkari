import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service key for deletes
)

const orderedNames = [
  "Pure Silk Kanchipuram Pattu",
  "Semi silk Kanchi Pattu",
  "Tussar Silk",
  "Moonga Tussar",
  "Bangalore Silk",
  "Cotton",
  "Linen",
  "Pochampalli",
  "Dola Silk",
  "Pure Crepe"
]

async function run() {
  // 1. Get Sarees category
  const { data: sareesCat } = await supabase
    .from('categories')
    .select('*')
    .eq('name', 'Sarees')
    .single()

  if (!sareesCat) {
    console.log("Sarees category not found!")
    return
  }

  // 2. Get all existing subcategories of Sarees
  const { data: existingSubs } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', sareesCat.id)
  
  console.log(`Found ${existingSubs?.length} existing subcategories`)

  // 3. Delete ones not in our list
  for (const sub of existingSubs || []) {
    const isKeep = orderedNames.some(name => name.toLowerCase() === sub.name.toLowerCase())
    if (!isKeep) {
      console.log(`Deleting ${sub.name}...`)
      await supabase.from('categories').delete().eq('id', sub.id)
    }
  }

  // 4. Create missing ones
  const existingNamesLower = (existingSubs || []).map(s => s.name.toLowerCase())
  let count = 0
  for (const name of orderedNames) {
    if (!existingNamesLower.includes(name.toLowerCase())) {
      console.log(`Creating ${name}...`)
      await supabase.from('categories').insert({
        name,
        slug: `sarees-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        parent_id: sareesCat.id
      })
      count++
    }
  }
  
  // Note: we can't update "created_at" to force ordering because the schema might not allow arbitrary created_at if it has default now().
  // So we will sort them on the frontend anyway.
  console.log(`Created ${count} missing categories. Done.`)
}
run()
