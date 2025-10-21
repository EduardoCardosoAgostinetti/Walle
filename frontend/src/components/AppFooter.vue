<template>
  <footer class="footer">
    <!-- Seções do footer -->
    <div class="footer-sections">
      <div class="footer-section">
        <h3>Quick Links</h3>
        <RouterLink to="/walle/home">Home</RouterLink>
        <RouterLink to="/walle/signin">Sign In</RouterLink>
        <RouterLink to="/walle/signup">Sign Up</RouterLink>
      </div>

      <div class="footer-section">
        <h3>Features</h3>
        <p>Personalized Workouts</p>
        <p>Motivational Tips</p>
      </div>

      <div class="footer-section">
        <h3>Follow Us</h3>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
      </div>
    </div>

    <!-- Barra divisória -->
    <div class="footer-divider"></div>

    <!-- Copyright -->
    <div class="footer-bottom">
      &copy; {{ new Date().getFullYear() }} Kryon. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>

<style scoped>
.footer {
  background-color: #282c34;
  color: white;
  padding: 40px 20px 20px 20px;
  font-family: Arial, sans-serif;
}

.footer-sections {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 30px;
  margin-bottom: 20px;
}

.footer-section h3 {
  margin-bottom: 15px;
}

.footer-section a,
.footer-section p {
  display: block;
  color: white;
  text-decoration: none;
  margin-bottom: 8px;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #ff7f50;
}

/* Barra divisória */
.footer-divider {
  width: 100%;
  height: 1px;
  background-color: #444;
  margin-bottom: 20px;
}

.footer-bottom {
  text-align: center;
  font-size: 0.9rem;
  color: #ccc;
}

@media (max-width: 768px) {
  .footer-sections {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
