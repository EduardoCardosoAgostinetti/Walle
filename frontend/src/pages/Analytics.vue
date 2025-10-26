<template>
  <div class="analytics-page">

    <div class="analytics-wrapper">
      <h2>Financial Analytics</h2>

      <div v-if="loading" class="loading">
        <p>Loading analytics...</p>
      </div>

      <div v-else class="charts-grid-container">

        <div class="totals-summary">
          <div class="total-card income">
            <h3>Total Income</h3>
            <p>${{ totalIncome }}</p>
          </div>
          <div class="total-card expense">
            <h3>Total Expenses</h3>
            <p>${{ totalExpense }}</p>
          </div>
        </div>

        <div class="charts-grid">
          <!-- Pie Chart - Category -->
          <transition name="fade">
            <div v-if="categoryData.datasets.length" class="chart-card">
              <h3>Expenses by Category</h3>
              <Pie :data="categoryData" />
            </div>
          </transition>



          <!-- Bar Chart - Income vs Expense -->
          <transition name="fade">
            <div v-if="incomeExpenseData.datasets.length" class="chart-card">
              <h3>Income vs Expenses</h3>
              <Bar :data="incomeExpenseData" />
            </div>
          </transition>



          <!-- Bar Chart - Top 5 Expense Categories -->
          <transition name="fade">
            <div v-if="topCategoriesData.datasets.length" class="chart-card">
              <h3>Top 5 Expense Categories</h3>
              <Bar :data="topCategoriesData" />
            </div>
          </transition>

          <!-- Doughnut Chart - Transaction Ratio -->
          <transition name="fade">
            <div v-if="typeRatioData.datasets.length" class="chart-card">
              <h3>Transaction Ratio</h3>
              <Pie :data="typeRatioData" />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Pie, Line, Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import api from "@/config/api";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const loading = ref(true);

const totalIncome = ref(0);
const totalExpense = ref(0);


// Dados dos gráficos
const categoryData = ref({ labels: [], datasets: [] });
const monthlyData = ref({ labels: [], datasets: [] });
const incomeExpenseData = ref({ labels: [], datasets: [] });
const incomeExpenseTrend = ref({ labels: [], datasets: [] });
const topCategoriesData = ref({ labels: [], datasets: [] });
const typeRatioData = ref({ labels: [], datasets: [] });

// Busca transações
const fetchTransactions = async () => {
  try {
    const res = await api.get("/transaction");
    processAnalytics(res.data.data);
    console.log("Response da API:", res);
  } catch (err) {
    console.error("Error fetching transactions:", err);
  } finally {
    loading.value = false;
  }
};

// Processa os dados
const processAnalytics = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) return;
  console.log("Transactions recebidas:", transactions);

  // 1️⃣ Expenses by Category
  const categoryMap = {};
  transactions.forEach((t) => {
    if (t.type === "expense") {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    }
  });

  categoryData.value = {
    labels: Object.keys(categoryMap),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(categoryMap),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#00E676", "#AA00FF"],
      },
    ],
  };



  // 3️⃣ Income vs Expenses total
  let income = 0, expense = 0;
  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") expense += t.amount;
  });
  totalIncome.value = income;
  totalExpense.value = expense;

  incomeExpenseData.value = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        label: "Income vs Expenses",
        data: [income, expense],
        backgroundColor: ["#00E676", "#FF6384"],
      },
    ],
  };

  // 5️⃣ Top 5 Expense Categories
  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  topCategoriesData.value = {
    labels: sortedCategories.map(([cat]) => cat),
    datasets: [
      {
        label: "Top Expense Categories",
        data: sortedCategories.map(([_, val]) => val),
        backgroundColor: "#FFB300",
      },
    ],
  };

  // 6️⃣ Transaction Ratio
  const incomeCount = transactions.filter(t => t.type === "income").length;
  const expenseCount = transactions.filter(t => t.type === "expense").length;
  typeRatioData.value = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        data: [incomeCount, expenseCount],
        backgroundColor: ["#00E676", "#FF6384"],
      },
    ],
  };
};

onMounted(fetchTransactions);
</script>

<style scoped>
.analytics-page {
  background: #41454eff;
  min-height: 100vh;
}

.analytics-wrapper {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

h2 {
  color: #00c853;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
}

.charts-grid-container {
  text-align: -webkit-center;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  align-content: center;
  background: #1b1f24;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  text-align: center;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

/* Loading */
.loading {
  text-align: center;
  color: #888;
  font-size: 1rem;
}

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.total-card {
  background: #1b1f24;
  padding: 0.5rem 1rem;
  /* Increase side padding slightly, keep vertical padding minimal */
  border-radius: 0.8rem;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  /* The next three lines are key for a tight fit */
  display: inline-block;
  width: auto;
  height: auto;
}

.total-card h3 {
  color: #fff;
  margin: 0;
  /* Remove default top/bottom margin */
  font-size: 0.85rem;
  font-weight: 500;
  /* Adjusted for better readability */
}

.total-card p {
  margin: 0;
  /* Remove default top/bottom margin */
  font-size: 1.4rem;
  /* Slightly larger for emphasis */
  font-weight: 600;
  line-height: 1.2;
  /* Reduce line height for closer text */
}

.totals-summary {
  display: flex;
  justify-content: center;
  /* Aligns to the left of its container */
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  /* Add max-width and center it to visually match the image layout */
  max-width: 400px;
  margin-left: 0;
  /* Align left */
}


.total-card.income {
  color: #00e676;
}

.total-card.expense {
  color: #ff5252;
}
</style>
