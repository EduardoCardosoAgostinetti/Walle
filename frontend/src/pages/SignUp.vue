<template>
  <div>
    <AppNavbar />

    <Loading v-if="loading" message="Creating your account..." />

    <Alerts
      v-if="alert.message"
      :type="alert.type"
      :message="alert.message"
      @close="handleAlertClose"
    />

    <div class="signup-container">
      <div class="signup-card">
        <h2>Create Account</h2>

        <form class="signup-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="full_name">Full Name</label>
            <input
              id="full_name"
              type="text"
              v-model="full_name"
              placeholder="Enter your full name"
            />
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              v-model="username"
              placeholder="Enter your username"
            />
          </div>

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

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              v-model="confirmPassword"
              placeholder="Confirm your password"
            />
          </div>

          <div class="form-check">
            <input type="checkbox" id="terms" v-model="terms" />
            <label for="terms">
              I accept the <router-link to="/walle/terms">terms of use</router-link>.
            </label>
          </div>

          <button type="submit" class="signup-btn">Sign Up</button>
        </form>

        <div class="signup-links">
          <p>
            Already have an account? <router-link to="/walle/signin">Sign In</router-link>
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

const full_name = ref("");
const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const terms = ref(false);

const alert = ref({ type: "", message: "" });
const loading = ref(false);

const handleSubmit = async () => {
  if (!full_name.value || !username.value || !email.value || !password.value || !confirmPassword.value) {
    alert.value = { type: "error", message: "Please fill in all fields." };
    return;
  }

  if (!terms.value) {
    alert.value = { type: "error", message: "You must accept the terms of use." };
    return;
  }

  loading.value = true;

  try {
    const { data } = await api.post("/user/register", {
      full_name: full_name.value,
      username: username.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    });

    alert.value = { type: "success", message: data.message };
    console.log(data);

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

const handleAlertClose = () => {
  if (alert.value.type === "success") {
    router.push("/walle/signin");
  }
  alert.value = { type: "", message: "" };
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px 20px;
  min-height: 70vh;
}

.signup-card {
  background: #282c34;
  padding: 36px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  width: 100%;
  max-width: 480px;
  color: white;
}

.signup-card *, .signup-card {
  box-sizing: border-box;
}

.signup-card h2 {
  font-size: 2rem;
  margin: 0 0 18px;
  color: #ffffff;
  text-align: left;
}

.signup-form {
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
  box-shadow: 0 0 0 3px rgba(255,127,80,0.12);
  border-color: #00c853;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #ccc;
}

.form-check input {
  accent-color: #00c853;
}

.form-check a {
  color: #00c853;
  text-decoration: none;
}

.form-check a:hover {
  text-decoration: underline;
  color: #00c853;
}

.signup-btn {
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
  transition: transform .12s ease, background .12s ease;
}

.signup-btn:hover {
  transform: translateY(-2px);
  background: #00c853;
}

.signup-links {
  margin-top: 14px;
  font-size: 0.9rem;
  color: #ccc;
  text-align: left;
}

.signup-links a {
  color: #00c853;
  text-decoration: none;
}

.signup-links a:hover {
  text-decoration: underline;
  color: #00c853;
}

@media (max-width: 600px) {
  .signup-card {
    padding: 24px;
    max-width: 360px;
  }
  .signup-card h2 {
    text-align: center;
  }
  .signup-links {
    text-align: center;
  }
}
</style>
