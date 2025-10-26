<template>
  <div>
    <Loading v-if="loading" message="Saving transaction..." />

    <Alerts
      v-if="alert.message"
      :type="alert.type"
      :message="alert.message"
      @close="alert = { type: '', message: '' }"
    />

    <div class="transaction-container">
      <div class="transaction-card">
        <h2>New Transaction</h2>

        <form class="transaction-form" @submit.prevent="saveTransaction">
          <div class="form-group">
            <label>Type</label>
            <select v-model="type">
              <option value="">Select type</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div class="form-group">
            <label>Amount</label>
            <input
              type="number"
              v-model="amount"
              placeholder="Enter the amount"
              min="0"
              step="0.01"
            />
          </div>

          <div class="form-group">
            <label>Category</label>
            <select v-model="category">
              <option value="">Select a category</option>
              <option value="health">Health</option>
              <option value="food">Food</option>
              <option value="car">Car</option>
              <option value="leisure">Leisure</option>
              <option value="fun">Fun stuff</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="description"
              placeholder="Enter a description (optional)"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Date</label>
            <input type="date" v-model="date" />
          </div>

          <button type="submit" class="save-btn" :disabled="loading">
            {{ loading ? "Saving..." : "Save Transaction" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../config/api";
import Alerts from "../components/Alerts.vue";
import Loading from "../components/Loading.vue";
import * as jwtDecode from "jwt-decode";

const alert = ref({ type: "", message: "" });
const loading = ref(false);

const type = ref("");
const amount = ref("");
const category = ref("");
const description = ref("");
const date = ref("");

const getUserId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode.jwtDecode(token);
    return decoded.id;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};

const saveTransaction = async () => {
  const userId = getUserId();

  if (!userId)
    return (alert.value = { type: "error", message: "User not identified!" });

  if (!type.value || !amount.value || !category.value || !date.value)
    return (alert.value = {
      type: "error",
      message: "Please fill all required fields.",
    });

  try {
    loading.value = true;
    await api.post("/transaction/create", {
      userId,
      type: type.value,
      amount: parseFloat(amount.value),
      category: category.value,
      description: description.value,
      date: date.value,
    });

    alert.value = { type: "success", message: "Transaction saved successfully!" };

    // Reset form
    type.value = "";
    amount.value = "";
    category.value = "";
    description.value = "";
    date.value = "";
  } catch (error) {
    console.error(error);
    alert.value = {
      type: "error",
      message: error.response?.data?.message || "Error saving transaction.",
    };
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

.transaction-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 50px 20px;
  min-height: 70vh;
  width: 100%;
  overflow-x: hidden;
}

.transaction-card {
  background: #282c34;
  padding: 36px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  width: 100%;
  max-width: 480px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 18px;
  word-wrap: break-word;
}

.transaction-card h2 {
  font-size: 1.8rem;
  margin-bottom: 12px;
  color: #00c853;
  display: flex;
  align-items: center;
  gap: 10px;
}

.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #3a3a3f;
  background: #fff;
  color: #000;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.15);
  border-color: #00c853;
}

.save-btn {
  padding: 14px;
  border-radius: 8px;
  background: #00c853;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease;
  width: 100%;
}

.save-btn:hover {
  transform: translateY(-2px);
  background: #00e676;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .transaction-container {
    padding: 30px 12px;
  }

  .transaction-card {
    padding: 24px;
    max-width: 100%;
  }

  .transaction-card h2 {
    font-size: 1.5rem;
  }

  .save-btn {
    font-size: 0.95rem;
    padding: 12px;
  }
}
</style>
