import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zsazhyhembflfabnvvau.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzYXpoeWhlbWJmbGZhYm52dmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjI3MDAsImV4cCI6MjA4ODU5ODcwMH0.TnPez-fU8jaFF4K42LjRYCQ-z8EUZZK9copHvMkLTxg'
);

async function test() {
  console.log('Fetching categories...');
  const { data: catData, error: catErr } = await supabase.from('categories').select('*').eq('type', 'ingredient');
  console.log('Categories:', catData || catErr);

  console.log('Fetching ingredients...');
  const { data: ingData, error: ingErr } = await supabase.from('ingredients').select('*').limit(3);
  console.log('Ingredients:', ingData || ingErr);
}

test();
