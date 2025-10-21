<template>
  <div>
    <Navbar />
    <div class="home">

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-text">
          <h1>Take control of your finances with Walle</h1>
          <p>The first step to saving is knowing where your money goes</p>
          <RouterLink to="/kryon/signup" class="cta-btn">Get Started</RouterLink>
        </div>
        <div class="hero-image">
          <img :src="HeroImage" alt="Fitness" />
        </div>
      </section>

      <!-- Motivational Section -->
      <section class="motivation">
        <h2>Daily Motivation</h2>
        <p>Don’t wait for the perfect moment. Turn every workout into progress!</p>
      </section>

      <!-- Features Section -->
      <section class="features">
        <h2>Features</h2>
        <div class="feature-cards">
          <div class="card">
            <img :src="Feature1" alt="Personalized Workouts" />
            <h3>Personalized Workouts</h3>
            <p>Create workouts tailored to your level and goals.</p>
          </div>

          <div class="card">
            <img :src="Feature2" alt="Progress Tracking" />
            <h3>Progress Tracking</h3>
            <p>Keep a close eye on your performance and growth.</p>
          </div>
        </div>
      </section>

    </div>
    <Footer />
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
import Navbar from "../components/AppNavbar.vue";
import Footer from "../components/AppFooter.vue";
import HeroImage from "../assets/HeroImage.png";
// import Feature1 from "../assets/feature1.png";
// import Feature2 from "../assets/feature2.png";
</script>

<style scoped>
.home {
  font-family: 'Arial', sans-serif;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* ================= Hero Section ================= */
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
  background-color: #28a745; /* Verde principal */
  color: white;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s;
}

.cta-btn:hover {
  background-color: #3ac26b; /* Verde mais claro no hover */
}

.hero-image img {
  width: 400px;
  max-width: 100%;
  border-radius: 10px;
}

/* ================= Motivational Section ================= */
.motivation {
  background-color: #1f4622; /* Verde escuro */
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

/* ================= Features Section ================= */
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
  background-color: #e6f4ea; /* Fundo levemente verde */
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
  max-width: 100%;
  margin-bottom: 15px;
}

.card h3 {
  margin-bottom: 10px;
}

/* ================= Responsividade ================= */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }
}
</style>
