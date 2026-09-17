const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function clearColors() {
  console.log("Clearing colors from all products...");
  
  // Since we want to empty the colors array, we can update it to an empty array.
  // We'll fetch all products first, then update them in batches or all at once.
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, name');
    
  if (fetchError) {
    console.error("Error fetching products:", fetchError);
    return;
  }
  
  console.log(`Found ${products.length} products to update.`);
  
  let successCount = 0;
  for (const product of products) {
    const { error: updateError } = await supabase
      .from('products')
      .update({ colors: [] })
      .eq('id', product.id);
      
    if (updateError) {
      console.error(`Error updating product ${product.id} (${product.name}):`, updateError);
    } else {
      successCount++;
    }
  }
  
  console.log(`Successfully cleared colors for ${successCount}/${products.length} products.`);
}

clearColors().catch(console.error);
