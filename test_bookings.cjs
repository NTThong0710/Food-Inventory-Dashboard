const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkBookings() {
  const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Error:", error);
  console.dir(data, { depth: null });
}
checkBookings();
