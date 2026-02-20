<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Créer un compte</h1>
      <p class="auth-subtitle">Rejoignez-nous dès maintenant</p>

      <!-- Formulaire d'inscription -->
      <form v-if="!successMsg" @submit.prevent="handleSignUp" novalidate>
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
            placeholder="8 caractères minimum"
            autocomplete="new-password"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirm">Confirmer le mot de passe</label>
          <input
            id="confirm"
            v-model="form.confirm"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            required
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading">Création en cours…</span>
          <span v-else>Créer mon compte</span>
        </button>
      </form>

      <!-- Message de confirmation email -->
      <div v-else class="success-msg">
        <span class="success-icon">✉️</span>
        <p>{{ successMsg }}</p>
        <p class="success-hint">Vérifiez votre boîte mail et cliquez sur le lien de confirmation.</p>
      </div>

      <div class="auth-links">
        <span>Déjà un compte ?</span>
        <router-link to="/login">Se connecter</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { supabase } from '@/lib/supabase'

const form = reactive({ email: '', password: '', confirm: '' })
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function handleSignUp() {
  errorMsg.value = ''

  // Validation locale
  if (form.password.length < 8) {
    errorMsg.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  if (form.password !== form.confirm) {
    errorMsg.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  loading.value = true

  const { error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      // URL de redirect après confirmation (configurer dans Supabase Dashboard)
      emailRedirectTo: `${window.location.origin}/`,
    },
  })

  if (error) {
    errorMsg.value = error.message
  } else {
    successMsg.value = `Un email de confirmation a été envoyé à ${form.email}.`
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
</style>
