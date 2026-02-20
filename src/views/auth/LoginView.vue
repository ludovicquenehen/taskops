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
