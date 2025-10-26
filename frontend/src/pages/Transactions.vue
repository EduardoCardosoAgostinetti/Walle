<template>
  <div>
    <Loading v-if="loading" message="Loading transactions..." />

    <Alerts v-if="alert.message" :type="alert.type" :message="alert.message"
      @close="alert = { type: '', message: '' }" />

    <div class="transactions-container">
      <div class="transactions-card">
        <h2>My Transactions</h2>
        <button class="refresh-btn" @click="fetchTransactions">Refresh</button>

        <div v-if="transactions.length === 0 && !loading" class="no-transactions">
          No transactions found.
        </div>

        <div v-for="(tx, index) in transactions" :key="tx.id" class="transaction-item">
          <div class="transaction-header">
            <div>
              <strong><span class="transaction-type" :class="tx.type">{{ tx.type }}</span></strong> <br><br>
              <span class="transaction-date">{{ formatDate(tx.date) }}</span>
            </div>
            <div class="transaction-actions">
              <button class="edit-btn" @click="handleEdit(tx)">Edit</button>
              <button class="delete-btn" @click="handleDeleteClick(tx)">Delete</button>
            </div>
          </div>
          <div class="transaction-body">
            <p><strong>Amount:</strong> ${{ tx.amount.toFixed(2) }}</p>
            <p><strong>Category:</strong> {{ tx.category }}</p>
            <p v-if="tx.description"><strong>Description:</strong> {{ tx.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="editingTransaction" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Transaction</h3>
          <button class="close-btn" @click="editingTransaction = null">X</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Type</label>
            <select v-model="editData.type">
              <option value="">Select type</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div class="form-group">
            <label>Amount</label>
            <input type="number" v-model.number="editData.amount" />
          </div>

          <div class="form-group">
            <label>Category</label>
            <select v-model="editData.category">
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
            <textarea rows="3" v-model="editData.description"></textarea>
          </div>

          <div class="form-group">
            <label>Date</label>
            <input type="date" v-model="editData.date" />
          </div>
        </div>

        <button class="save-btn" @click="saveChanges">Save Changes</button>
      </div>
    </div>

    <!-- DELETE CONFIRM MODAL -->
    <div v-if="showDeleteModal && deleteTransaction" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button class="close-btn" @click="showDeleteModal = false">X</button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this transaction of ${{ deleteTransaction.amount.toFixed(2) }}?
        </div>
        <div class="modal-actions">
          <button class="delete-btn" @click="confirmDelete">Delete</button>
          <button class="modal-add-btn" @click="showDeleteModal = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../config/api";
import Alerts from "../components/Alerts.vue";
import Loading from "../components/Loading.vue";
import * as jwtDecode from "jwt-decode";

const transactions = ref([]);
const loading = ref(false);
const alert = ref({ type: "", message: "" });

const editingTransaction = ref(null);
const editData = ref(null);

const deleteTransaction = ref(null);
const showDeleteModal = ref(false);

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

const formatDate = (dateStr) => {
  return dateStr;
};


const fetchTransactions = async () => {
  const userId = getUserId();
  if (!userId) return alert.value = { type: "error", message: "User not identified!" };

  try {
    loading.value = true;
    const res = await api.get(`/transaction`);
    transactions.value = (res.data.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (err) {
    console.error(err);
    alert.value = { type: "error", message: err.response?.data?.message || "Error loading transactions" };
  } finally {
    loading.value = false;
  }
};

// --- EDIT ---
const handleEdit = (tx) => {
  editingTransaction.value = tx;
  editData.value = { ...tx };
};

const saveChanges = async () => {
  if (!editingTransaction.value) return;
  try {
    loading.value = true;
    await api.put(`/transaction/edit/${editingTransaction.value.id}`, editData.value);
    alert.value = { type: "success", message: "Transaction updated successfully!" };
    editingTransaction.value = null;
    fetchTransactions();
  } catch (err) {
    console.error(err);
    alert.value = { type: "error", message: err.response?.data?.message || "Error updating transaction" };
  } finally {
    loading.value = false;
  }
};

// --- DELETE ---
const handleDeleteClick = (tx) => {
  deleteTransaction.value = tx;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!deleteTransaction.value) return;
  try {
    loading.value = true;
    await api.delete(`/transaction/delete/${deleteTransaction.value.id}`);
    alert.value = { type: "success", message: "Transaction deleted successfully!" };
    showDeleteModal.value = false;
    deleteTransaction.value = null;
    fetchTransactions();
  } catch (err) {
    console.error(err);
    alert.value = { type: "error", message: err.response?.data?.message || "Error deleting transaction" };
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTransactions);
</script>

<style scoped>
.transactions-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  min-height: 70vh;
}

.transactions-card {
  width: 100%;
  color: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transactions-card h2 {
  font-size: 1.6rem;
  color: #00c853;
}

.refresh-btn {
  background: #3a3a3f;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  align-self: flex-end;
}

.refresh-btn:hover {
  background: #4a4a4f;
}

.transaction-item {
  background: #20232a;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-type.income {
  color: #00e676;
  font-weight: bold;
}

.transaction-type.expense {
  color: #ff3d00;
  font-weight: bold;
}

.transaction-actions button {
  margin-left: 8px;
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.edit-btn {
  background: #3a3a3f;
  color: #fff;
}

.edit-btn:hover {
  background: #4a4a4f;
}

.delete-btn {
  background: #ff3d00;
  color: #fff;
}

.delete-btn:hover {
  background: #ff5c33;
}

.transaction-body p {
  margin: 4px 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
  /* evita overflow em telas pequenas */
  box-sizing: border-box;
}

.modal {
  background: #1f2128;
  color: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  /* importante para inputs não extrapolarem */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #444;
  background: #fff;
  color: #000;
  box-sizing: border-box;
  /* garante que padding e border fiquem dentro da largura */
}

.save-btn,
.modal-add-btn,
.delete-btn {
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  border: none;
}

.save-btn {
  background: #00c853;
  color: #fff;
}

.save-btn:hover {
  background: #00e676;
}

.modal-add-btn {
  background: #10c538;
  color: #fff;
}

.delete-btn {
  background: #ff3d00;
  color: #fff;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.no-transactions {
  text-align: center;
  color: #aaa;
  font-style: italic;
}
</style>
