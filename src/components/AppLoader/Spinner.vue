<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="spinner"
    aria-label="Chargement…"
    role="status"
  >
    <!-- Piste de fond -->
    <circle
      cx="25"
      cy="25"
      r="20"
      stroke="#e8f0fe"
      stroke-width="5"
    />
    <!-- Arc animé -->
    <circle
      cx="25"
      cy="25"
      r="20"
      stroke="#0070f3"
      stroke-width="5"
      stroke-linecap="round"
      stroke-dasharray="80 45"
    />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 32 },
})
</script>

<style scoped>
.spinner {
  animation: spin 0.8s linear infinite;
  display: block;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
