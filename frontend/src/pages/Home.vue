<template>
  <div>
    <AppNavbar />

    <div class="home">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-text">
          <h1>Manage Your Finances with Walle</h1>
          <p>Track income, expenses, and view financial charts all in one place.</p>
          <RouterLink to="/walle/signup" class="cta-btn">Get Started</RouterLink>
        </div>

        <div class="hero-image">
          <img :src="HeroImage" alt="Finance illustration" />
        </div>
      </section>

      <!-- Motivation Section -->
      <section class="motivation">
        <h2>Tip of the Day</h2>
        <p>Don’t leave it for tomorrow — start managing your finances today!</p>
      </section>

      <!-- Features Section -->
      <section class="features">
        <h2>Features</h2>
        <div class="feature-cards">
          <div class="card">
            <img :src="Feature1" alt="Income and Expenses" />
            <h3>Income and Expenses</h3>
            <p>Record every transaction and always know where your money goes.</p>
          </div>

          <div class="card">
            <img :src="Feature2" alt="Financial Charts" />
            <h3>Financial Charts</h3>
            <p>Track your progress with clear and detailed financial charts.</p>
          </div>
        </div>
      </section>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import AppNavbar from "@/components/Navbar.vue";
import AppFooter from "@/components/Footer.vue";
import HeroImage from "@/assets/finance-hero.png";
import Feature1 from "@/assets/feature-1.png";
import Feature2 from "@/assets/feature-2.png";
import { RouterLink } from "vue-router";
</script>

<style scoped>
.home {
  font-family: 'Arial', sans-serif;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 50px;
  gap: 20px;
}

.hero-text {
  flex: 1;
  min-width: 250px;
}

.hero-text h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.hero-text p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.cta-btn {
  padding: 10px 20px;
  background-color: #00c853; /* Walle Green */
  color: white;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s;
}

.cta-btn:hover {
  background-color: #00a844;
}

.hero-image img {
  width: 400px;
  max-width: 100%;
  border-radius: 10px;
}

.features {
  text-align: center;
  margin-bottom: 50px;
}

.features h2 {
  font-size: 2rem;
  margin-bottom: 30px;
}

.feature-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.card {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}

.card img {
  width: 350px;
  margin-bottom: 15px;
}

.card h3 {
  margin-bottom: 10px;
}

.motivation {
  background-color: #1b1f24; /* Walle Dark Background */
  color: white;
  text-align: center;
  padding: 40px 20px;
  border-radius: 10px;
  margin-bottom: 90px;
}

.motivation h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }
}
</style>
