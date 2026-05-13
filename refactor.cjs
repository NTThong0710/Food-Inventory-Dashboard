const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// The absolute path to the src directory
const SRC_DIR = path.join(__dirname, 'src');

// Define the target structure and how files move
const moves = [
  // Auth
  { src: 'views/LoginView.vue', dest: 'features/auth/views/LoginView.vue' },
  { src: 'views/ForgotPasswordView.vue', dest: 'features/auth/views/ForgotPasswordView.vue' },
  { src: 'views/UpdatePasswordView.vue', dest: 'features/auth/views/UpdatePasswordView.vue' },
  { src: 'stores/auth.ts', dest: 'features/auth/store.ts' },

  // Dashboard
  { src: 'views/DashboardView.vue', dest: 'features/dashboard/views/DashboardView.vue' },

  // Inventory
  { src: 'components/inventory', dest: 'features/inventory/components' },
  { src: 'views/IngredientsView.vue', dest: 'features/inventory/views/IngredientsView.vue' },
  { src: 'stores/inventory.ts', dest: 'features/inventory/store.ts' },

  // Dishes
  { src: 'components/dishes', dest: 'features/dishes/components' },
  { src: 'views/DishesView.vue', dest: 'features/dishes/views/DishesView.vue' },
  { src: 'stores/dishes.ts', dest: 'features/dishes/store.ts' },

  // Batches
  { src: 'components/batches', dest: 'features/batches/components' },
  { src: 'views/BatchesView.vue', dest: 'features/batches/views/BatchesView.vue' },
  { src: 'stores/batches.ts', dest: 'features/batches/store.ts' },

  // Sales
  { src: 'components/sales', dest: 'features/sales/components' },
  { src: 'views/SalesView.vue', dest: 'features/sales/views/SalesView.vue' },
  { src: 'stores/sales.ts', dest: 'features/sales/store.ts' },

  // Suppliers
  { src: 'components/suppliers', dest: 'features/suppliers/components' },
  { src: 'views/SuppliersView.vue', dest: 'features/suppliers/views/SuppliersView.vue' },
  { src: 'stores/suppliers.ts', dest: 'features/suppliers/store.ts' },

  // Account
  { src: 'views/AccountView.vue', dest: 'features/account/views/AccountView.vue' },

  // Shared
  { src: 'components/layout', dest: 'shared/components/layout' },
  { src: 'components/ui', dest: 'shared/components/ui' },
  { src: 'stores/currency.ts', dest: 'shared/stores/currency.ts' },
  { src: 'stores/theme.ts', dest: 'shared/stores/theme.ts' },
  { src: 'lib', dest: 'shared/lib' }
];

// Import Replacements Dictionary
const replaceMap = {
  '@/views/LoginView.vue': '@/features/auth/views/LoginView.vue',
  '@/views/ForgotPasswordView.vue': '@/features/auth/views/ForgotPasswordView.vue',
  '@/views/UpdatePasswordView.vue': '@/features/auth/views/UpdatePasswordView.vue',
  '@/stores/auth': '@/features/auth/store',
  '@/views/DashboardView.vue': '@/features/dashboard/views/DashboardView.vue',

  '@/components/inventory/': '@/features/inventory/components/',
  '@/views/IngredientsView.vue': '@/features/inventory/views/IngredientsView.vue',
  '@/stores/inventory': '@/features/inventory/store',

  '@/components/dishes/': '@/features/dishes/components/',
  '@/views/DishesView.vue': '@/features/dishes/views/DishesView.vue',
  '@/stores/dishes': '@/features/dishes/store',

  '@/components/batches/': '@/features/batches/components/',
  '@/views/BatchesView.vue': '@/features/batches/views/BatchesView.vue',
  '@/stores/batches': '@/features/batches/store',

  '@/components/sales/': '@/features/sales/components/',
  '@/views/SalesView.vue': '@/features/sales/views/SalesView.vue',
  '@/stores/sales': '@/features/sales/store',

  '@/components/suppliers/': '@/features/suppliers/components/',
  '@/views/SuppliersView.vue': '@/features/suppliers/views/SuppliersView.vue',
  '@/stores/suppliers': '@/features/suppliers/store',

  '@/views/AccountView.vue': '@/features/account/views/AccountView.vue',

  '@/components/layout/': '@/shared/components/layout/',
  '@/components/ui/': '@/shared/components/ui/',
  '@/stores/currency': '@/shared/stores/currency',
  '@/stores/theme': '@/shared/stores/theme',
  '@/lib/': '@/shared/lib/'
};

// Also account for relative imports that might be moved. Actually, all project uses `@/...` imports mostly,
// but we need to also replace things like `import '../views/LoginView.vue'` in `router/index.ts`.
// Let's add router replacements:
const routerReplaceMap = {
  "'../views/LoginView.vue'": "'../features/auth/views/LoginView.vue'",
  "'../views/ForgotPasswordView.vue'": "'../features/auth/views/ForgotPasswordView.vue'",
  "'../views/UpdatePasswordView.vue'": "'../features/auth/views/UpdatePasswordView.vue'",
  "'../views/DashboardView.vue'": "'../features/dashboard/views/DashboardView.vue'",
  "'../views/AccountView.vue'": "'../features/account/views/AccountView.vue'",
  "'../views/IngredientsView.vue'": "'../features/inventory/views/IngredientsView.vue'",
  "'../views/DishesView.vue'": "'../features/dishes/views/DishesView.vue'",
  "'../views/SuppliersView.vue'": "'../features/suppliers/views/SuppliersView.vue'",
  "'../views/BatchesView.vue'": "'../features/batches/views/BatchesView.vue'",
  "'../views/SalesView.vue'": "'../features/sales/views/SalesView.vue'",
};

// 1. Move files
console.log('--- Moving files ---');
for (const move of moves) {
  const srcPath = path.join(SRC_DIR, move.src);
  const destPath = path.join(SRC_DIR, move.dest);
  
  if (fs.existsSync(srcPath)) {
    // Create dir if not exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Move using copy and delete (safer on Windows with locked files)
    if (fs.statSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
      try { fs.rmSync(srcPath, { recursive: true, force: true }); } catch (e) {}
    } else {
      fs.copyFileSync(srcPath, destPath);
      try { fs.unlinkSync(srcPath); } catch (e) {}
    }
    console.log(`Moved: ${move.src} -> ${move.dest}`);
  } else {
    console.log(`Warning: Source not found: ${move.src}`);
  }
}

// 2. Scan and replace content in all .ts, .vue files
console.log('\n--- Updating imports ---');
function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (!fs.existsSync(dirPath)) return;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== 'dist' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

walkDir(SRC_DIR, (filePath) => {
  if (filePath.endsWith('.vue') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Apply aliases replacement
    for (const [key, value] of Object.entries(replaceMap)) {
      // Use global regex for key
      const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escapedKey, 'g');
      content = content.replace(regex, value);
    }

    // Apply router replacement explicitly
    if (filePath.includes('router')) {
      for (const [key, value] of Object.entries(routerReplaceMap)) {
        content = content.replace(new RegExp(key, 'g'), value);
      }
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in: ${path.relative(SRC_DIR, filePath)}`);
    }
  }
});

// Clean up empty directories in views/, components/, stores/
['views', 'components', 'stores'].forEach(dir => {
  const dirPath = path.join(SRC_DIR, dir);
  if (fs.existsSync(dirPath)) {
    try {
      if (fs.readdirSync(dirPath).length === 0) {
        fs.rmdirSync(dirPath);
      } else {
        // recursively try to delete empty subfolders
        walkAndRemoveEmpty(dirPath);
      }
    } catch(e) {}
  }
});

function walkAndRemoveEmpty(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    if (files.length === 0) {
        fs.rmdirSync(dir);
        return;
    }
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkAndRemoveEmpty(fullPath);
        }
    }
    // Check again
    if (fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
    }
}

console.log('\n✅ Refactoring completed successfully!');
