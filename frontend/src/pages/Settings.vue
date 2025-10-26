<template>
    <div class="settings-page">
        <!-- Alerts -->
        <Alerts v-if="alert.message" :type="alert.type" :message="alert.message"
            @close="alert = { type: '', message: '' }" />

        <h2>Settings</h2>

        <!-- Account Section -->
        <div class="settings-card">
            <div class="settings-row" @click="showAccountDetails = !showAccountDetails">
                <span>Account</span>
                <div :class="['chevron', { open: showAccountDetails }]">
                    <ChevronRight size="20" />
                </div>
            </div>

            <div v-if="showAccountDetails && user" class="user-details-card">
                <div v-for="field in userFields" :key="field.key" class="user-detail">
                    <div class="detail-header">
                        <span class="detail-label">{{ field.label }}</span>
                        <button class="edit-btn" @click="openEditModal(field.key, field.value)">
                            <Pencil size="16" />
                        </button>
                    </div>
                    <span class="detail-value">{{ field.value }}</span>
                </div>
            </div>

            <!-- Security Section -->
            <div class="settings-row" @click="showSecurityDetails = !showSecurityDetails">
                <span>Security</span>
                <div :class="['chevron', { open: showSecurityDetails }]">
                    <ChevronRight size="20" />
                </div>
            </div>

            <div v-if="showSecurityDetails" class="security-card">
                <div class="security-item" @click="passwordModal = true">
                    <Shield size="18" />
                    <span>Change Password</span>
                </div>
            </div>

            <!-- About Section -->
            <div class="settings-row" @click="showAboutDetails = !showAboutDetails">
                <span>About</span>
                <div :class="['chevron', { open: showAboutDetails }]">
                    <ChevronRight size="20" />
                </div>
            </div>

            <div v-if="showAboutDetails" class="about-card">
                <h4>About this App</h4>
                <p>
                    Walle is an application created to help users manage their finances efficiently.
                    Track expenses, monitor income, and achieve your financial goals with ease.
                </p>
                <p class="version">Version 1.0.0</p>
            </div>
        </div>

        <!-- Logout -->
        <div class="settings-card logout-card" @click="logoutModal = true">
            <div class="settings-row logout">
                <span>Logout</span>
                <ChevronRight size="20" />
            </div>
        </div>

        <!-- Edit Modal -->
        <div v-if="modalOpen" class="modal-overlay" @click="modalOpen = false">
            <div class="modal" @click.stop>
                <h3>Edit {{ editField }}</h3>
                <label>Current Value</label>
                <input type="text" :value="currentValue" disabled class="disabled-input" />
                <label>New Value</label>
                <input type="text" v-model="newValue" :placeholder="'Enter new ' + editField" />
                <div class="modal-actions">
                    <button class="cancel-btn" @click="modalOpen = false">Cancel</button>
                    <button class="save-btn" @click="handleSave" :disabled="!newValue.trim() || loading">
                        {{ loading ? "Saving..." : "Save" }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Password Modal -->
        <div v-if="passwordModal" class="modal-overlay" @click="passwordModal = false">
            <div class="modal" @click.stop>
                <h3>Change Password</h3>
                <label>Current Password</label>
                <input type="password" v-model="currentPassword" placeholder="Enter current password" />
                <label>New Password</label>
                <input type="password" v-model="newPassword" placeholder="Enter new password" />
                <label>Confirm New Password</label>
                <input type="password" v-model="confirmPassword" placeholder="Confirm new password" />
                <div class="modal-actions">
                    <button class="cancel-btn" @click="passwordModal = false">Cancel</button>
                    <button class="save-btn" @click="handlePasswordUpdate" :disabled="loading">
                        {{ loading ? "Updating..." : "Update" }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Logout Modal -->
        <div v-if="logoutModal" class="modal-overlay" @click="logoutModal = false">
            <div class="modal" @click.stop>
                <h3>Confirm Logout</h3>
                <p>Are you sure you want to log out?</p>
                <div class="modal-actions">
                    <button class="cancel-btn" @click="logoutModal = false">Cancel</button>
                    <button class="logout-btn" @click="handleLogout">Logout</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { ChevronRight, Pencil, Shield } from "lucide-vue-next";
import { useRouter } from "vue-router";
import * as jwtDecode from "jwt-decode";
import Alerts from "@/components/Alerts.vue";
import api from "@/config/api";

const router = useRouter();

const showAccountDetails = ref(false);
const showSecurityDetails = ref(false);
const showAboutDetails = ref(false);

const user = ref(null);
const modalOpen = ref(false);
const editField = ref("");
const currentValue = ref("");
const newValue = ref("");

const logoutModal = ref(false);
const passwordModal = ref(false);
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const alert = ref({ type: "", message: "" });
const loading = ref(false);

// Carrega e mapeia o usuário do token
onMounted(() => {
    const token = localStorage.getItem("token");
    if (token) {
        const decoded = jwtDecode.jwtDecode(token);
        user.value = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username,
            full_name: decoded.full_name,
        };
    }
});

// Computed para os campos do usuário
const userFields = computed(() => {
    if (!user.value) return [];
    return [
        { key: "full_name", label: "Name", value: user.value.full_name },
        { key: "email", label: "Email", value: user.value.email },
        { key: "username", label: "Username", value: user.value.username },
    ];
});

const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/walle/signin");
};

const openEditModal = (field, value) => {
    editField.value = field;
    currentValue.value = value;
    newValue.value = "";
    modalOpen.value = true;
};

const handleSave = async () => {
    if (!newValue.value.trim()) return;
    loading.value = true;
    try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        let endpoint = "";
        let payload = {};

        if (editField.value === "full_name") {
            endpoint = "/user/update-fullname";
            payload = { full_name: newValue.value };
        } else if (editField.value === "email") {
            endpoint = "/user/update-email";
            payload = { email: newValue.value };
        } else if (editField.value === "username") {
            endpoint = "/user/update-username";
            payload = { username: newValue.value };
        }

        const result = await api.put(endpoint, payload, config);

        // ✅ Atualiza token e usuário se vier um novo
        if (result.data?.data?.token) {
            localStorage.setItem("token", result.data.data.token);
            const decoded = jwtDecode.jwtDecode(result.data.data.token);
            user.value = {
                id: decoded.id,
                email: decoded.email,
                username: decoded.username,
                full_name: decoded.full_name,
            };
        } else {
            user.value[editField.value] = newValue.value;
        }

        // ✅ Corrigido: mensagem vem de result.data.message
        alert.value = { type: "success", message: result.data.message || "Updated successfully." };
        modalOpen.value = false;
    } catch (error) {
        console.error("Erro no update:", error);
        alert.value = { type: "error", message: error.response?.data?.message || "Server connection error." };
    } finally {
        loading.value = false;
    }
};


const handlePasswordUpdate = async () => {
    if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
        return (alert.value = { type: "error", message: "All password fields are required." });
    }
    if (newPassword.value !== confirmPassword.value) {
        return (alert.value = { type: "error", message: "Passwords do not match." });
    }

    loading.value = true;
    try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const payload = {
            userId: user.value.id,
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
            confirmPassword: confirmPassword.value,
        };
        const { data } = await api.put("/user/update-password", payload, config);
        alert.value = { type: "success", message: data.message };
        passwordModal.value = false;
        currentPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";
    } catch (error) {
        alert.value = { type: "error", message: error.response?.data?.message || "Server connection error." };
    } finally {
        loading.value = false;
    }
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
</script>
<style scoped>
.settings-page {
    padding: 20px;
    font-family: 'Segoe UI', sans-serif;
    color: #fff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

h2 {
    color: #00c853;
    font-size: 2rem;
    margin-bottom: 20px;
}

.settings-card {
    background: #20232a;
    border-radius: 12px;
    width: 100%;
    max-width: 650px;
    margin-bottom: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
}

.settings-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid #3a3a3f;
    font-size: 1rem;
}

.settings-row:last-child {
    border-bottom: none;
}

.settings-row:hover {
    background: #2a2d36;
}

.logout span {
    color: #ff4d4f;
    font-weight: bold;
}

.logout-card {
    margin-top: 10px;
}

.user-details-card,
.security-card,
.about-card {
    background: #2a2d36;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border-radius: 10px;
    margin: 8px 0;
}

.user-detail {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.detail-label {
    font-size: 0.9rem;
    color: #bbb;
}

.detail-value {
    font-size: 1rem;
    color: #fff;
    font-weight: 500;
}

.edit-btn {
    background: none;
    border: none;
    color: #00c853;
    cursor: pointer;
    transition: color 0.2s;
}

.edit-btn:hover {
    color: #00e676;
}

.security-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    background: #20232a;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
}

.security-item:hover {
    background: #2a2d36;
}

.about-card h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: bold;
    color: #00c853;
}

.about-card p {
    margin: 0;
    color: #ccc;
    font-size: 0.9rem;
    line-height: 1.5;
}

.about-card .version {
    margin-top: 8px;
    font-weight: bold;
    color: #2ecc71;
}

.chevron {
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
}

.chevron.open {
    transform: rotate(90deg);
}

/* Modals */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background: #20232a;
    padding: 24px;
    border-radius: 12px;
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.modal h3 {
    margin: 0;
    text-transform: capitalize;
    font-size: 1.2rem;
    color: #00c853;
}

.modal label {
    font-size: 0.9rem;
    color: #bbb;
    margin-top: 8px;
}

.modal input {
    padding: 8px;
    border-radius: 8px;
    border: none;
    outline: none;
    font-size: 0.9rem;
    background: #2a2d36;
    color: #fff;
}

.disabled-input {
    background: #3a3f42;
    color: #aaa;
    cursor: not-allowed;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
}

.cancel-btn,
.save-btn,
.logout-btn {
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: bold;
}

.cancel-btn {
    background: #777;
    color: #fff;
}

.save-btn {
    background: #00c853;
    color: #fff;
}

.logout-btn {
    background: #ff4d4f;
    color: #fff;
}

.save-btn:hover {
    background: #00e676;
}

.logout-btn:hover {
    background: #ff6b6d;
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 600px) {
    .settings-card {
        padding: 10px;
    }
}
</style>
