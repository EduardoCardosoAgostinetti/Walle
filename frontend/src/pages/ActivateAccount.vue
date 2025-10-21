<template>
  <div>
    <AppNavbar />

    <Loading v-if="loading" message="Activating account..." />

    <Alerts
      v-if="alert.message"
      :type="alert.type"
      :message="alert.message"
      @close="alert = { type: '', message: '' }"
    />

    <div class="activate-container">
      <div class="activate-card">
        <h2 :style="{ color: messageColor }">{{ message }}</h2>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"; // ✅ adicionei computed
import { useRoute, useRouter } from "vue-router";
import api from "../config/api";
import AppNavbar from "../components/Navbar.vue";
import AppFooter from "../components/Footer.vue";
import Alerts from "../components/Alerts.vue";
import Loading from "../components/Loading.vue";

const route = useRoute();
const router = useRouter();

const message = ref("Activating account...");
const status = ref("info"); // info, success, warning, error
const alert = ref({ type: "", message: "" });
const loading = ref(true);

const token = route.query.token;
const called = ref(false);

const messageColor = computed(() => {
  switch (status.value) {
    case "success": return "#28a745";
    case "warning": return "#ffc107";
    case "error": return "#dc3545";
    default: return "#17a2b8";
  }
});

const activateAccount = async () => {
  if (called.value) return;
  called.value = true;

  if (!token) {
    message.value = "Activation token missing.";
    status.value = "error";
    loading.value = false;
    return;
  }

  try {
    const { data } = await api.get(`/user/activate-account?token=${token}`);
    
        if(data.success){
            status.value = "success";
        }else{
            status.value = "error";
        }
        message.value = data.message;
        setTimeout(() => router.push("/walle/signin"), 4000);

  } catch (err) {
    if (err.response && err.response.data) {
      message.value = err.response.data.message || "Error activating account.";
    } else {
      message.value = "Error activating account.";
    }
    status.value = "error";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  activateAccount();
});
</script>

<style scoped>
      .activate-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 50px 20px;
        min-height: 70vh;
      }

      .activate-card {
        background: #282c34;
        padding: 36px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        width: 100%;
        max-width: 420px;
        text-align: center;
        color: white;
      }

      .activate-card h2 {
        font-size: 1.8rem;
        margin: 0;
      }

      @media (max-width: 600px) {
        .activate-card {
          padding: 24px;
          max-width: 360px;
        }
        .activate-card h2 {
          font-size: 1.6rem;
        }
      }
    </style>