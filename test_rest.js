import { api } from './src/lib/axios.ts'; // We can't easily run vue/ts files with node without tsx.

// Actually I can just write a quick fetch test
async function run() {
  const { data } = await fetch('https://zsazhyhembflfabnvvau.supabase.co/rest/v1/categories?type=eq.ingredient', {
    headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzYXpoeWhlbWJmbGZhYm52dmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjI3MDAsImV4cCI6MjA4ODU5ODcwMH0.TnPez-fU8jaFF4K42LjRYCQ-z8EUZZK9copHvMkLTxg',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzYXpoeWhlbWJmbGZhYm52dmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjI3MDAsImV4cCI6MjA4ODU5ODcwMH0.TnPez-fU8jaFF4K42LjRYCQ-z8EUZZK9copHvMkLTxg'
    }
  }).then(r => r.json()).then(data => ({ data }));
  console.log("Categories:", data);
}
run();
