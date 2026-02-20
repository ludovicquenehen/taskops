<template>
  <div class="auth-page">
    <div class="auth-card">

      <!-- ── Étape 1 : Saisir l'email pour recevoir le lien ── -->
      <template v-if="step === 'request'">
        <h1 class="auth-title">Mot de passe oublié</h1>
        <p class="auth-subtitle">
          Saisissez votre email pour recevoir un lien de réinitialisation.
        </p>

        <form v-if="!successMsg" @submit.prevent="handleRequest" novalidate>
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

          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading">Envoi en cours…</span>
            <span v-else>Envoyer le lien</span>
          </button>
        </form>

        <div v-else class="success-msg">
          <span class="success-icon">✉️</span>
          <p>{{ successMsg }}</p>
          <p class="success-hint">Consultez votre boîte mail et cliquez sur le lien.</p>
        </div>
      </template>

      <!-- ── Étape 2 : Nouveau mot de passe (après clic sur le lien email) ── -->
      <template v-else-if="step === 'update'">
        <h1 class="auth-title">Nouveau mot de passe</h1>
        <p class="auth-subtitle">Choisissez un nouveau mot de passe sécurisé.</p>

        <form v-if="!successMsg" @submit.prevent="handleUpdate" novalidate>
          <div class="form-group">
            <label for="new-password">Nouveau mot de passe</label>
            <input
              id="new-password"
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
            <span v-if="loading">Mise à jour…</span>
            <span v-else>Mettre à jour le mot de passe</span>
          </button>
        </form>

        <div v-else class="success-msg">
          <span class="success-icon">✅</span>
          <p>{{ successMsg }}</p>
          <router-link to="/login" class="btn-primary" style="display:block; margin-top:1.25rem; text-align:center; text-decoration:none;">
            Se connecter
          </router-link>
        </div>
      </template>

      <div class="auth-links" v-if="!successMsg">
        <router-link to="/login">← Retour à la connexion</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

/**
 * Supabase envoie un lien de type :
 *   https://votre-app.vercel.app/reset-password#access_token=...&type=recovery
 *
 * Quand l'utilisateur clique dessus, Supabase émet un événement
 * PASSWORD_RECOVERY que l'on écoute pour passer à l'étape 2.
 */

const step = ref('request')  // 'request' | 'update'
const form = reactive({ email: '', password: '', confirm: '' })
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Écoute l'événement PASSWORD_RECOVERY émis par Supabase
onMounted(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      step.value = 'update'
    }
  })

  // Cleanup à la destruction du composant
  // (optionnel dans les SPA, recommandé pour éviter les fuites mémoire)
  return () => subscription.unsubscribe()
})

// ── Étape 1 : envoi de l'email ────────────────────────────────────────────────
async function handleRequest() {
  errorMsg.value = ''
  loading.value = true

  const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
    // URL vers laquelle Supabase redirigera après le clic sur le lien
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    errorMsg.value = error.message
  } else {
    successMsg.value = `Un email a été envoyé à ${form.email}.`
  }

  loading.value = false
}

// ── Étape 2 : mise à jour du mot de passe ────────────────────────────────────
async function handleUpdate() {
  errorMsg.value = ''

  if (form.password.length < 8) {
    errorMsg.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  if (form.password !== form.confirm) {
    errorMsg.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  loading.value = true

  const { error } = await supabase.auth.updateUser({
    password: form.password,
  })

  if (error) {
    errorMsg.value = error.message
  } else {
    successMsg.value = 'Mot de passe mis à jour avec succès !'
    await supabase.auth.signOut()
  }

  loading.value = false
}
</script>