<template>
  <div>
    <AppNavbar />

    <div class="terms">
      <section class="terms-header">
        <h1>Terms of Use</h1>
        <p>
          Welcome to Walle! By using our platform, you agree to the terms and
          conditions described below.
        </p>
      </section>

      <section class="terms-content">
        <div class="term-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Walle, you agree to comply with these Terms
            of Use and all applicable laws and regulations. If you do not agree,
            please do not use the service.
          </p>
        </div>

        <div class="term-section">
          <h2>2. Platform Usage</h2>
          <p>
            Walle is intended for personal finance management. You agree to use
            the service ethically, avoiding any fraudulent, offensive, or harmful
            behavior toward others.
          </p>
        </div>

        <div class="term-section">
          <h2>3. User Account</h2>
          <p>
            To access certain features, you must create an account. You are
            responsible for maintaining the confidentiality of your login
            credentials and for all activities that occur under your account.
          </p>
        </div>

        <div class="term-section">
          <h2>4. Data Privacy</h2>
          <p>
            We respect your privacy. Your financial data is stored securely and
            will not be shared with third parties without your consent, except
            as required by law.
          </p>
        </div>

        <div class="term-section">
          <h2>5. Modifications</h2>
          <p>
            Walle reserves the right to modify these Terms at any time. We
            will notify you of significant changes through the app or via email.
          </p>
        </div>

        <div class="term-section">
          <h2>6. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact our support team.
          </p>
        </div>
      </section>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import AppNavbar from "@/components/Navbar.vue";
import AppFooter from "@/components/Footer.vue";
</script>

<style scoped>
.terms {
  font-family: 'Arial', sans-serif;
  color: #333;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  line-height: 1.6;
}

.terms-header {
  text-align: center;
  margin-bottom: 50px;
}

.terms-header h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: #00c853; /* Walle Green */
}

.terms-header p {
  font-size: 1.1rem;
  color: #555;
}

.term-section {
  margin-bottom: 40px;
}

.term-section h2 {
  color: #00c853; /* Walle Green */
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.term-section p {
  font-size: 1rem;
  color: #444;
}

a {
  color: #00c853;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .terms {
    padding: 20px;
  }

  .terms-header h1 {
    font-size: 2rem;
  }

  .term-section h2 {
    font-size: 1.3rem;
  }
}
</style>
