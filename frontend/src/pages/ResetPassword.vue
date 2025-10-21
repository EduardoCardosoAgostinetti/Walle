<template>
  <div>
    <AppNavbar />

    <Loading v-if="loading" message="Resetting your password..." />

    <Alerts
      v-if="alert.message"
      :type="alert.type"
      :message="alert.message"
      @close="handleAlertClose"
    />

    <div class="forgot-container">
      <div class="forgot-card">
        <h2>Reset Password</h2>
        <p class="forgot-description">
          Enter your new password below and confirm it to reset your account.
        </p>

        <form class="forgot-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              v-model="newPassword"
              id="newPassword"
              type="password"
              placeholder="Enter new password"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              v-model="confirmPassword"
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" class="send-btn">
            Reset Password
          </button>
        </form>

        <div class="forgot-links">
          <router-link to="/walle/signin">Back to Sign In</router-link>
        </div>
      </div>
    </div>

    <AppFooter />

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../config/api";
import AppNavbar from "../components/Navbar.vue";
import AppFooter from "../components/Footer.vue";
import Alerts from "../components/Alerts.vue";
import Loading from "../components/Loading.vue";

const router = useRouter();
const route = useRoute();

const newPassword = ref("");
const confirmPassword = ref("");
const alert = ref({ type: "", message: "" });
const loading = ref(false);

const token = route.query.token;

const handleSubmit = async () => {
  if (!newPassword.value.trim() || !confirmPassword.value.trim()) {
    alert.value = { type: "error", message: "Please fill out all fields." };
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    alert.value = { type: "error", message: "Passwords do not match." };
    return;
  }

  if (!token) {
    alert.value = { type: "error", message: "Invalid or missing reset token." };
    return;
  }

  loading.value = true;
  try {
    const { data } = await api.post("/user/reset-password", {
      token,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value,
    });

    alert.value = { type: "success", message: data.message };
  } catch (error) {
    if (error.response) {
      alert.value = { type: "error", message: error.response.data.message };
    } else {
      alert.value = { type: "error", message: "Server connection error." };
    }
  } finally {
    loading.value = false;
  }
};

const handleAlertClose = () => {
  if (alert.value.type === "success") {
    router.push("/walle/signin");
  }
  alert.value = { type: "", message: "" };
};
</script>

<style scoped>
      .forgot-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 50px 20px;
        min-height: 70vh;
      }

      .forgot-card {
        background: #282c34;
        padding: 36px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        width: 100%;
        max-width: 420px;
        color: white;
        box-sizing: border-box;
      }

      .forgot-card * {
        box-sizing: border-box;
      }

      .forgot-card h2 {
        font-size: 2rem;
        margin-bottom: 10px;
        color: #ffffff;
      }

      .forgot-description {
        font-size: 0.95rem;
        color: #ccc;
        margin-bottom: 20px;
        line-height: 1.4;
      }

      .forgot-form {
        display: flex;
        flex-direction: column;
        gap: 14px;
        align-items: stretch;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
      }

      .form-group label {
        font-weight: 600;
        color: #ddd;
        font-size: 0.95rem;
      }

      .form-group input {
        width: 100%;
        padding: 12px 14px;
        border-radius: 8px;
        border: 1px solid #3a3a3f;
        background: #fff;
        color: #000;
        font-size: 1rem;
      }

      .form-group input::placeholder {
        color: #9b9b9b;
      }

      .form-group input:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(255,127,80,0.12);
        border-color: #00a844;
      }

      .send-btn {
        display: inline-block;
        width: 100%;
        padding: 12px 14px;
        border-radius: 8px;
        background: #00a844;
        color: #fff;
        font-weight: 700;
        font-size: 1rem;
        border: none;
        cursor: pointer;
        transition: transform .12s ease, background .12s ease;
      }

      .send-btn:hover {
        transform: translateY(-2px);
        background: #00a844;
      }

      .forgot-links {
        margin-top: 16px;
        text-align: center;
      }

      .forgot-links a {
        color: #00a844;
        text-decoration: none;
        font-weight: 500;
      }

      .forgot-links a:hover {
        text-decoration: underline;
      }

      @media (max-width: 600px) {
        .forgot-card {
          padding: 24px;
          max-width: 360px;
        }
        .forgot-card h2,
        .forgot-description {
          text-align: center;
        }
      }
    </style>