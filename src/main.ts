import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useThemeStore } from '@/shared/stores/theme'

import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Aura from '@primevue/themes/aura';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.dark', 
            cssLayer: false // Giúp style của PrimeVue không bị Tailwind làm mất
        }
    }
});
app.use(ToastService);

// Initialize theme
const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
