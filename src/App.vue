<template>
  <RouterView />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
let authSubscription = null

onMounted(() => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      router.push('/login')
    }

    if (event === 'TOKEN_REFRESHED') {
      // Supabase renouvelle le token automatiquement, rien à faire
      console.log('Token refreshed')
    }

    if (event === 'SIGNED_IN' && router.currentRoute.value.name === 'Login') {
      router.push('/')
    }
  })

  authSubscription = data.subscription
})

onUnmounted(() => {
  authSubscription?.unsubscribe()
})
</script>