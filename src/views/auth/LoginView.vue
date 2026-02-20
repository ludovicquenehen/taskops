<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Connexion</h1>
      <p class="auth-subtitle">Bienvenue, connectez-vous à votre compte</p>

      <form @submit.prevent="handleLogin" novalidate>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="vous@exemple.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading">Connexion en cours…</span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <div class="auth-links">
        <router-link to="/reset-password">Mot de passe oublié ?</router-link>
        <span>·</span>
        <router-link to="/signup">Créer un compte</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  })

  if (error) {
    errorMsg.value = error.message
  } else {
    // Redirige vers la page demandée ou le dashboard
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }

  loading.value = false
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 1rem;
}

.auth-card {
  background: #fff;
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
</style>
