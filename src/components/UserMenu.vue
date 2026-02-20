<template>
  <div class="user-menu" v-if="user">
    <div class="user-info" @click="open = !open">
      <img v-if="user.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" class="avatar" alt="avatar" />
      <div class="avatar-placeholder" v-else>
        {{ initials }}
      </div>
      <div v-if="open" class="user-details">
        <span class="user-name">{{ displayName }}</span>
        <span class="user-email">{{ user.email }}</span>
      </div>
    </div>

    <button v-if="open" class="btn-logout" @click="handleLogout" :disabled="loading">
      {{ loading ? "Déconnexion…" : "Se déconnecter" }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { supabase, getUser } from "@/lib/supabase";

const router = useRouter();
const user = ref(null);
const loading = ref(false);
const open = ref(false);

// ── Chargement de l'utilisateur courant ──────────────────────────────────────
onMounted(async () => {
  user.value = await getUser();
});

// ── Sync en temps réel si la session change ──────────────────────────────────
const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null;
});
onUnmounted(() => subscription.unsubscribe());

// ── Infos dérivées ───────────────────────────────────────────────────────────
const displayName = computed(
  () => user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || user.value?.email?.split("@")[0] || "Utilisateur"
);

const initials = computed(() =>
  displayName.value
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
);

// ── Déconnexion ──────────────────────────────────────────────────────────────
async function handleLogout() {
  loading.value = true;
  await supabase.auth.signOut();
  router.push("/login");
  loading.value = false;
}
</script>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 8px;
  background: var(--bg);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.user-email {
  font-size: 0.8rem;
  color: #888;
}

.btn-logout {
  padding: 0.45rem 0.9rem;
  background: transparent;
  color: var(--ko);
  border: 1px solid var(--ko);
  border-radius: 7px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}

.btn-logout:hover:not(:disabled) {
  background: var(--ko);
  color: #fff;
}

.btn-logout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
