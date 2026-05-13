const fs = require('fs');
const files = [
  'src/features/dashboard/views/DashboardView.vue',
  'src/shared/components/ui/chart/WebsiteVisitsChart.vue',
  'src/shared/components/ui/chart/RevenueChart.vue'
];

const colorMap = {
  'amber-50': '[#fffbeb]',
  'gray-100': '[#f3f4f6]',
  'gray-400': '[#9ca3af]',
  'gray-500': '[#6b7280]',
  'gray-700': '[#374151]',
  'gray-900': '[#111827]',
  'green-500': '[#22c55e]',
  'green-600': '[#16a34a]',
  'green-700': '[#15803d]',
  'red-500': '[#ef4444]',
  'red-700': '[#b91c1c]',
  'orange-500': '[#f97316]',
  'orange-600': '[#ea580c]'
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  for (const [twColor, hexClass] of Object.entries(colorMap)) {
    const rx = new RegExp('([a-z]+)-' + twColor, 'g');
    content = content.replace(rx, '$1-' + hexClass);
  }
  fs.writeFileSync(file, content);
  console.log('Processed ' + file);
});
