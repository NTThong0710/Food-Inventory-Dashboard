<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Redirect to unified login page
const router = useRouter();
onMounted(() => router.replace('/login'));
</script>
