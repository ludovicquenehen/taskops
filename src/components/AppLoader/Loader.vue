<template>
  <!-- Fullscreen overlay -->
  <div v-if="fullscreen" class="loader-overlay">
    <div class="loader-box">
      <Spinner :size="size" />
      <span v-if="label" class="loader-label">{{ label }}</span>
    </div>
  </div>

  <!-- Inline -->
  <div v-else class="loader-inline">
    <Spinner :size="size" />
    <span v-if="label" class="loader-label">{{ label }}</span>
  </div>
</template>

<script setup>
import Spinner from "./Spinner.vue";

defineProps({
  fullscreen: { type: Boolean, default: false },
  label: { type: String, default: "" },
  size: { type: Number, default: 64 },
});
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  background: rgba(245, 245, 245, 0.3);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loader-box {
  background: var(--bg);
  border-radius: 12px;
  padding: 2rem 6rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loader-inline {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.loader-label {
  font-size: 1.5rem;
  color: #666;
  font-weight: 500;
}
</style>
