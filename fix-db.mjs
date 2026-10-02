import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const newHash = "pbkdf2$210000$u8zZelSbAkIAC8T0ozalBQ==$m1YAxbtUJroYL1xRnp30jVQKJH8ktld6lxPAnU2uQJQ="

async function fix() {
  const { data, error } = await supabase.from('admin_users').update({ password_hash: newHash }).eq('email', 'e@e.co')
  if (error) console.error(error)
  else console.log("Fixed user password")
}

fix()
