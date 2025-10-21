<template>
  <nav class="navbar">
    <!-- Logo -->
    <div class="logo" @click="navigateTo('/walle/home')">
      <img src="@/assets/LogoWalleWhite.png" alt="Walle Logo" />
    </div>

    <!-- Links -->
    <div class="links" :class="{ open: isOpen }">
      <template v-if="!isLogged">
        <RouterLink to="/walle/home" class="nav-btn">
          <Home size="18" />
          <span>Home</span>
        </RouterLink>

        <RouterLink to="/walle/signin" class="nav-btn">
          <LogIn size="18" />
          <span>Sign In</span>
        </RouterLink>

        <RouterLink to="/walle/signup" class="nav-btn signup">
          <UserPlus size="18" />
          <span>Sign Up</span>
        </RouterLink>
      </template>

      <template v-else>
        <RouterLink to="/walle/dashboard" class="nav-btn">
          <LayoutDashboard size="18" />
          <span>Dashboard</span>
        </RouterLink>

        <button class="nav-btn logout" @click="logout">
          <LogOut size="18" />
          <span>Log Out</span>
        </button>
      </template>
    </div>

    <!-- Menu Toggle (mobile) -->
    <button class="menu-toggle" @click="isOpen = !isOpen">☰</button>
  </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Home, LayoutDashboard, LogIn, UserPlus, LogOut } from "lucide-vue-next";

const router = useRouter();
const isOpen = ref(false);
const isLogged = ref(false);

onMounted(() => {
  const token = localStorage.getItem("token");
  isLogged.value = !!token;
});

function navigateTo(path) {
  router.push(path);
}

function logout() {
  localStorage.removeItem("token");
  isLogged.value = false;
  router.push("/walle/signin");
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #1b1f24;
  color: white;
  position: relative;
}

.logo img {
  height: 50px;
  cursor: pointer;
}

.links {
  display: flex;
  gap: 10px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  background-color: #2a2f36;
  color: white;
  text-decoration: none;
  transition: background 0.3s, transform 0.2s;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}

.nav-btn:hover {
  background-color: #00c853;
  transform: translateY(-2px);
  color: white;
}

.nav-btn.signup {
  background-color: #00c853;
}

.nav-btn.signup:hover {
  background-color: #00a844;
}

.nav-btn.logout {
  background-color: #ef4444;
}

.nav-btn.logout:hover {
  background-color: #dc2626;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

@media (max-width: 600px) {
  .links {
    display: none;
    flex-direction: column;
    gap: 10px;
    position: absolute;
    top: 60px;
    right: 20px;
    background-color: #1b1f24;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .links.open {
    display: flex;
  }

  .menu-toggle {
    display: block;
  }

  .nav-btn {
    justify-content: flex-start;
    width: 160px;
  }
}
</style>
