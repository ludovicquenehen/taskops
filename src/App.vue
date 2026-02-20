<template>
  <RouterView />
  <Logo v-if="!logged" class="main-logo" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { supabase, getUser } from "@/lib/supabase";
import Logo from "@/components/Logo.vue";

let authSubscription = null;

const router = useRouter();
const logged = ref(false);

onMounted(async () => {
  logged.value = !!(await getUser())?.id;

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      router.push("/login");
      logged.value = false;
    }

    if (event === "TOKEN_REFRESHED") {
      // Supabase renouvelle le token automatiquement, rien à faire
      console.log("Token refreshed");
    }

    if (event === "SIGNED_IN" && router.currentRoute.value.name === "Login") {
      router.push("/");
      logged.value = true;
    }
  });

  authSubscription = data.subscription;
});

onUnmounted(() => {
  authSubscription?.unsubscribe();
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap");

:root {
  --bg: #0d0f14;
  --bg2: #141720;
  --bg3: #1c2030;
  --border: #252a3a;
  --text: #e8eaf0;
  --text2: #8890a8;
  --accent: #4f8cff;
  --accent2: #6c3fff;
  --ok: #22c97a;
  --ko: #ff4f6a;
  --warn: #ffb944;
  --na: #8890a8;
  --mono: "Space Mono", monospace;
  --sans: "DM Sans", sans-serif;
  --sidebar-w: 260px;
  --sidebar-collapsed-w: 52px;
  --sidebar-transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  height: 100vh;
  overflow: hidden;
}

#app {
  display: flex;
  width: 100%;
  height: 100vh;
}

.auth-page {
  min-height: 100vh;
  min-width: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg3);
  padding: 1rem;
}

.auth-card {
  background: var(--bg2);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.auth-subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
}

input {
  padding: 0.65rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  outline: none;
}

input:focus {
  border-color: #0070f3;
}

.error-msg {
  color: #e00;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.75rem;
  background: #fff0f0;
  border-radius: 6px;
}

.success-msg {
  text-align: center;
  padding: 1.5rem 0;
}

.success-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
}

.success-hint {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #0070f3;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #005fd4;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-links {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.auth-links a {
  color: #0070f3;
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}

.main-logo {
  margin: auto;
  padding-bottom: 4rem;
  transform: scale(4);
}
</style>
