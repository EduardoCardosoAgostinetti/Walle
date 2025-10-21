<template>
  <div v-if="message" class="alert-overlay">
    <div class="alert-box" :style="{ backgroundColor: bgColor, color: textColor }">
      <p>{{ message }}</p>
      <button
        class="alert-btn"
        @click="onClose"
        @mouseover="hover = true"
        @mouseleave="hover = false"
        :style="buttonStyle"
      >
        Fechar
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  type: { type: String, default: "default" },
  message: { type: String, default: "" },
  onClose: { type: Function, required: true }
});

const hover = ref(false);

const bgColor = computed(() => {
  switch (props.type) {
    case "success": return "#d1fae5";
    case "error": return "#fee2e2";
    case "warning": return "#fef3c7";
    default: return "#f3f4f6";
  }
});

const textColor = computed(() => {
  switch (props.type) {
    case "success": return "#065f46";
    case "error": return "#991b1b";
    case "warning": return "#92400e";
    default: return "#1f2937";
  }
});

const btnBg = computed(() => {
  switch (props.type) {
    case "success": return "#00C853"; // Verde principal do Walle
    case "error": return "#ef4444";
    case "warning": return "#f59e0b";
    default: return "#6b7280";
  }
});

const btnHover = computed(() => {
  switch (props.type) {
    case "success": return "#00A844";
    case "error": return "#dc2626";
    case "warning": return "#d97706";
    default: return "#4b5563";
  }
});

const buttonStyle = computed(() => ({
  backgroundColor: hover.value ? btnHover.value : btnBg.value,
  color: "white",
  transition: "background 0.2s ease, transform 0.2s ease"
}));
</script>

<style scoped>
.alert-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.alert-box {
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  max-width: 400px;
  width: 100%;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
}

.alert-btn {
  margin-top: 16px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.alert-btn:hover {
  transform: translateY(-2px);
}
</style>
