import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
dotenv.config({ path: ".env.local" })
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function test() {
  const { data } = await db.from("products").select("name, description").ilike("description", "%all over%").limit(2)
  console.log(data)
}
test()
