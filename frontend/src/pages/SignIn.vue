<template>
  <div>
    <AppNavbar />

    <Loading v-if="loading" message="Logging into your account..." />

    <Alerts
      v-if="alert.message"
      :type="alert.type"
      :message="alert.message"
      @close="alert = { type: '', message: '' }"
    />

    <div class="signin-container">
      <div class="signin-card">
        <h2>Sign In</h2>

        <form class="signin-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              v-model="email"
              placeholder="Enter your email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              v-model="password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" class="login-btn">Login</button>
        </form>

        <div class="signin-links">
          <router-link to="/walle/forgot-password">Forgot your password?</router-link>
          <p>
            Don’t have an account? <router-link to="/walle/signup">Sign Up</router-link>
          </p>
        </div>
      </div>
    </div>

    <AppFooter />

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../config/api";
import AppNavbar from "../components/Navbar.vue";
import AppFooter from "../components/Footer.vue";
import Alerts from "../components/Alerts.vue";
import Loading from "../components/Loading.vue";

const router = useRouter();

const email = ref("");
const password = ref("");
const alert = ref({ type: "", message: "" });
const loading = ref(false);

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    alert.value = { type: "error", message: "Please fill in all fields." };
    return;
  }

  loading.value = true;

  try {
    const { data } = await api.post("/user/login", {
      email: email.value,
      password: password.value,
    });

    localStorage.setItem("token", data.data.token);
    router.push("/walle/dashboard/transactions");
    console.log(data.data.token);
  } catch (error) {
    if (error.response) {
      alert.value = { type: "error", message: error.response.data.message };
      console.log(error.response.data);
    } else {
      alert.value = { type: "error", message: "Server connection error." };
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Container for the sign-in card */
.signin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px 20px;
  min-height: 70vh;
}

/* Sign-in card styling */
.signin-card {
  background: #282c34;
  padding: 36px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  width: 100%;
  max-width: 420px;
  color: white;
}

.signin-card,
.signin-card * {
  box-sizing: border-box;
}

.signin-card h2 {
  font-size: 2rem;
  margin: 0 0 18px;
  color: #ffffff;
  text-align: left;
}

.signin-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: stretch;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  background: #ffffffff;
  color: #000000ff;
  font-size: 1rem;
}

.form-group input::placeholder {
  color: #9b9b9b;
}

.form-group input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.12);
  border-color: #00c853;
}

/* Login button styling */
.login-btn {
  display: inline-block;
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  background: #00c853;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  background: #00c853;
}

/* Links below the form */
.signin-links {
  margin-top: 14px;
  font-size: 0.9rem;
  color: #ccc;
  text-align: left;
}

.signin-links a {
  color: #00c853;
  text-decoration: none;
}

.signin-links a:hover {
  text-decoration: underline;
  color: #00c853;
}

@media (max-width: 600px) {
  .signin-card {
    padding: 24px;
    max-width: 360px;
  }
  .signin-card h2 {
    text-align: center;
  }
  .signin-links {
    text-align: center;
  }
}
</style>
