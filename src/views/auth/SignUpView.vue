<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Créer un compte</h1>
      <p class="auth-subtitle">Rejoignez-nous dès maintenant</p>

      <!-- Formulaire d'inscription -->
      <form v-if="!successMsg" @submit.prevent="handleSignUp" novalidate>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" placeholder="vous@exemple.com" autocomplete="email" required />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input id="password" v-model="form.password" type="password" placeholder="8 caractères minimum" autocomplete="new-password" required />
        </div>

        <div class="form-group">
          <label for="confirm">Confirmer le mot de passe</label>
          <input id="confirm" v-model="form.confirm" type="password" placeholder="••••••••" autocomplete="new-password" required />
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
import { reactive, ref } from "vue";
import { supabase } from "@/lib/supabase";

const form = reactive({ email: "", password: "", confirm: "" });
const loading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

async function handleSignUp() {
  errorMsg.value = "";

  // Validation locale
  if (form.password.length < 8) {
    errorMsg.value = "Le mot de passe doit contenir au moins 8 caractères.";
    return;
  }
  if (form.password !== form.confirm) {
    errorMsg.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  loading.value = true;

  const { error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      // URL de redirect après confirmation (configurer dans Supabase Dashboard)
      emailRedirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    errorMsg.value = error.message;
  } else {
    successMsg.value = `Un email de confirmation a été envoyé à ${form.email}.`;
  }

  loading.value = false;
}
</script>