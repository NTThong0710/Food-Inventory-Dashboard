<template>
  <div class="min-h-screen bg-[#0C160A] text-white overflow-x-hidden font-sans relative flex flex-col">
    <!-- Decorative Background Effects -->
    <div class="absolute top-0 right-0 w-1/2 h-1/2 bg-[#4ade80] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#22c55e] rounded-full blur-[150px] opacity-[0.15] pointer-events-none"></div>
    
    <!-- Navbar -->
    <nav class="relative z-10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-linear-to-br from-[#4ade80] to-[#22c55e] flex items-center justify-center text-[#0C160A]">
          <ChefHat class="w-6 h-6" />
        </div>
        <h1 class="text-xl font-bold tracking-wider">NOVA<span class="text-[#4ade80]">RESTO</span></h1>
      </div>
      
      <div class="flex items-center">
        <router-link to="/dashboard" class="group relative px-6 py-2.5 rounded-full overflow-hidden bg-[#132210] border border-[#22c55e]/30 hover:border-[#4ade80]/60 transition-all duration-300">
          <div class="absolute inset-0 bg-linear-to-r from-[#4ade80]/10 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <span class="relative z-10 flex items-center gap-2 text-sm font-medium">
            Tới Trang Quản Trị
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </router-link>
      </div>
    </nav>

    <!-- Hero Section -->
    <main class="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-16 lg:pt-2">
      <div class="text-center max-w-4xl mx-auto">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#132210] border border-[#22c55e]/20 mb-8 animate-fade-in-up">
          <Sparkles class="w-4 h-4 text-[#4ade80]" />
          <span class="text-xs font-semibold uppercase tracking-widest text-[#86efac]">Hệ thống quản lý thông minh</span>
        </div>
        
        <h2 class="text-5xl lg:text-7xl font-extrabold leading-tight mb-8 animate-fade-in-up animation-delay-100">
          Nâng Tầm Đẳng Cấp <br class="hidden md:block"/>
          <span class="text-transparent bg-clip-text bg-linear-to-r from-[#4ade80] to-[#22c55e]">
            Nhà Hàng Của Bạn
          </span>
        </h2>
        
        <p class="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
          Trải nghiệm hệ thống quản trị nhà hàng toàn diện. Quản lý kho nguyên liệu chính xác, tối ưu hóa lợi nhuận món ăn và theo dõi doanh thu theo thời gian thực.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
          <router-link to="/menu" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#4ade80] hover:bg-[#22c55e] text-[#0C160A] font-bold text-lg transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2">
            <Utensils class="w-5 h-5" /> Khám Phá Thực Đơn
          </router-link>
          <a href="#features" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#132210] hover:bg-[#1a2d16] border border-[#22c55e]/20 hover:border-[#4ade80]/50 text-white font-semibold text-lg transition-all flex items-center justify-center gap-2">
            Các Tính Năng
            <ChevronDown class="w-5 h-5" />
          </a>
        </div>
      </div>
      
      <!-- Stats/Trust indicators -->
      <div class="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/5 animate-fade-in-up animation-delay-400">
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-1">100%</div>
          <div class="text-sm text-gray-500 uppercase tracking-wider">Độ Chính Xác</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-1">24/7</div>
          <div class="text-sm text-gray-500 uppercase tracking-wider">Kiểm Soát Nhịp Độ</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-1">+35%</div>
          <div class="text-sm text-gray-500 uppercase tracking-wider">Tối Ưu Lợi Nhuận</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-1">Bảo Mật</div>
          <div class="text-sm text-gray-500 uppercase tracking-wider">Phân Quyền RBAC</div>
        </div>
      </div>
    </main>

    <!-- Features Section -->
    <section id="features" class="relative z-10 w-full bg-[#132210]/50 border-t border-white/5 py-24">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <h3 class="text-3xl md:text-4xl font-bold mb-4">Tính Năng Cốt Lõi</h3>
          <p class="text-gray-400 max-w-2xl mx-auto">Mọi công cụ bạn cần để vận hành nhà hàng trơn tru và chuyên nghiệp.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-[#0C160A] p-8 rounded-2xl border border-white/5 hover:border-[#4ade80]/30 transition-colors group">
            <div class="w-14 h-14 rounded-xl bg-[#132210] flex items-center justify-center mb-6 border border-[#22c55e]/20 group-hover:bg-[#4ade80]/10 transition-colors">
              <Package class="w-7 h-7 text-[#4ade80]" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-white">Quản Lý Kho</h4>
            <p class="text-gray-400 leading-relaxed">Theo dõi chi tiết số lượng nguyên liệu, hạn sử dụng, và tự động cảnh báo khi tồn kho sắp hết hoặc sắp hỏng.</p>
          </div>
          
          <!-- Feature 2 -->
          <div class="bg-[#0C160A] p-8 rounded-2xl border border-white/5 hover:border-[#4ade80]/30 transition-colors group">
            <div class="w-14 h-14 rounded-xl bg-[#132210] flex items-center justify-center mb-6 border border-[#22c55e]/20 group-hover:bg-[#4ade80]/10 transition-colors">
              <Utensils class="w-7 h-7 text-[#4ade80]" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-white">Định Lượng Món Ăn</h4>
            <p class="text-gray-400 leading-relaxed">Thiết lập công thức chuẩn xác cho từng món, tự động trừ kho nguyên liệu khi món được bán ra.</p>
          </div>
          
          <!-- Feature 3 -->
          <div class="bg-[#0C160A] p-8 rounded-2xl border border-white/5 hover:border-[#4ade80]/30 transition-colors group">
            <div class="w-14 h-14 rounded-xl bg-[#132210] flex items-center justify-center mb-6 border border-[#22c55e]/20 group-hover:bg-[#4ade80]/10 transition-colors">
              <TrendingUp class="w-7 h-7 text-[#4ade80]" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-white">Phân Tích Lợi Nhuận</h4>
            <p class="text-gray-400 leading-relaxed">Tính toán biên lợi nhuận thời gian thực. Cân đối giá bán và chi phí nguyên liệu trượt giá để tối đa hoá doanh thu.</p>
          </div>
          
          <!-- Feature 4 -->
          <div class="bg-[#0C160A] p-8 rounded-2xl border border-white/5 hover:border-[#4ade80]/30 transition-colors group">
            <div class="w-14 h-14 rounded-xl bg-[#132210] flex items-center justify-center mb-6 border border-[#22c55e]/20 group-hover:bg-[#4ade80]/10 transition-colors">
              <ClipboardList class="w-7 h-7 text-[#4ade80]" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-white">Lô Nhập Hàng</h4>
            <p class="text-gray-400 leading-relaxed">Lưu vết nhập hàng rành mạch từ nhà cung cấp nào, số lượng bao nhiêu, giá tiền và quy đổi đơn vị dễ dàng.</p>
          </div>
          
          <!-- Feature 5 -->
          <div class="bg-[#0C160A] p-8 rounded-2xl border border-white/5 hover:border-[#4ade80]/30 transition-colors group">
            <div class="w-14 h-14 rounded-xl bg-[#132210] flex items-center justify-center mb-6 border border-[#22c55e]/20 group-hover:bg-[#4ade80]/10 transition-colors">
              <BarChart3 class="w-7 h-7 text-[#4ade80]" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-white">Báo Cáo PDF Trực Quan</h4>
            <p class="text-gray-400 leading-relaxed">Xuất báo cáo tổng quan dạng PDF/Excel đẹp mắt chỉ với một cú click, nắm bắt tình hình kinh doanh trong chớp mắt.</p>
          </div>
          
          <!-- Feature 6 -->
          <div class="bg-[#0C160A] p-8 rounded-2xl border border-white/5 hover:border-[#4ade80]/30 transition-colors group">
            <div class="w-14 h-14 rounded-xl bg-[#132210] flex items-center justify-center mb-6 border border-[#22c55e]/20 group-hover:bg-[#4ade80]/10 transition-colors">
              <ShieldCheck class="w-7 h-7 text-[#4ade80]" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-white">Phân Quyền Chặt Chẽ</h4>
            <p class="text-gray-400 leading-relaxed">Quản lý Admin, Quản lý kho, đến nhân viên bếp với các quyền xem, sửa, xoá được phân ranh giới rõ ràng.</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="relative z-10 w-full py-8 text-center text-gray-600 border-t border-white/5 bg-[#0C160A]">
      <p>&copy; 2026 NovaResto. Dashboard Quản Lý Nhà Hàng Cao Cấp. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { 
  ChefHat, 
  ArrowRight, 
  Sparkles, 
  ChevronDown, 
  Package, 
  Utensils, 
  TrendingUp, 
  ClipboardList, 
  BarChart3, 
  ShieldCheck 
} from 'lucide-vue-next';
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}

.animation-delay-100 {
  animation-delay: 100ms;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}
</style>
