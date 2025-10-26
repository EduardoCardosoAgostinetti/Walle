<template>
  <div class="dashboard-page">
    <AppNavbar />

    <div class="dashboard-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <h2 class="sidebar-logo">Walle</h2>
        <nav class="sidebar-nav">
          <RouterLink
            to="/walle/dashboard/transactions"
            class="nav-link"
            :class="{ active: currentPath.includes('transactions') }"
          >
            <Wallet size="22" />
            <span>Transactions</span>
          </RouterLink>

          <!-- ✅ Nova opção de gráficos -->
          <RouterLink
            to="/walle/dashboard/analytics"
            class="nav-link"
            :class="{ active: currentPath.includes('analytics') }"
          >
            <BarChart3 size="22" />
            <span>Analytics</span>
          </RouterLink>

          <RouterLink
            to="/walle/dashboard/new-transactions"
            class="nav-link"
            :class="{ active: currentPath.includes('new') }"
          >
            <PlusCircle size="22" />
            <span>New Transaction</span>
          </RouterLink>

          

          <RouterLink
            to="/walle/dashboard/settings"
            class="nav-link"
            :class="{ active: currentPath.includes('settings') }"
          >
            <SettingsIcon size="22" />
            <span>Settings</span>
          </RouterLink>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="dashboard-content">
        <router-view />
      </main>
    </div>

    <!-- Bottom nav (mobile) -->
    <nav class="bottom-nav">
      <button
        class="bottom-btn"
        :class="{ active: currentPath.includes('transactions') }"
        @click="navigate('/walle/dashboard/transactions')"
      >
        <Wallet size="24" />
        <span>Transactions</span>
      </button>

       <!-- ✅ Novo botão de Analytics -->
      <button
        class="bottom-btn"
        :class="{ active: currentPath.includes('analytics') }"
        @click="navigate('/walle/dashboard/analytics')"
      >
        <BarChart3 size="24" />
        <span>Analytics</span>
      </button>

      <button
        class="bottom-btn"
        :class="{ active: currentPath.includes('new') }"
        @click="navigate('/walle/dashboard/new-transactions')"
      >
        <PlusCircle size="24" />
        <span>New</span>
      </button>

     

      <button
        class="bottom-btn"
        :class="{ active: currentPath.includes('settings') }"
        @click="navigate('/walle/dashboard/settings')"
      >
        <SettingsIcon size="24" />
        <span>Settings</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import AppNavbar from "@/components/Navbar.vue";
import { Wallet, PlusCircle, Settings as SettingsIcon, BarChart3 } from "lucide-vue-next"; // ✅ Adicionado BarChart3

const router = useRouter();
const route = useRoute();
const currentPath = route.path;

function navigate(path) {
  router.push(path);
}
</script>

<style scoped>
/* (mantém o mesmo estilo anterior) */
.dashboard-page {
  background: #20232a;
  color: white;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.dashboard-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  background: #1c1f26;
  width: 250px;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-right: 1px solid #333;
}

.sidebar-logo {
  color: #00c853;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 30px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ccc;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  font-size: 1rem;
}

.nav-link.active,
.nav-link:hover {
  color: #00c853;
}

/* Bottom navbar */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background-color: #1c1f26;
  justify-content: space-around;
  align-items: center;
  border-top: 2px solid #333;
  z-index: 10;
}

.bottom-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: color 0.2s, transform 0.2s;
}

.bottom-btn:hover {
  color: #00c853;
  transform: translateY(-3px);
}

.bottom-btn.active {
  color: #00c853;
}

/* Dashboard content */
.dashboard-content {
  flex: 1;
  background: #41454eff;
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
}

/* Responsividade */
@media (max-width: 900px) {
  .sidebar {
    display: none;
  }

  .bottom-nav {
    display: flex;
  }

  .dashboard-content {
    padding: 5px;
    padding-bottom: 100px;
  }
}
</style>
