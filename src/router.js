import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/lib/supabase";

// Views
import LoginView from "@/views/auth/LoginView.vue";
import SignUpView from "@/views/auth/SignUpView.vue";
import ResetPasswordView from "@/views/auth/ResetPasswordView.vue";
import DashboardView from "@/views/DashboardView.vue"; // à adapter

const routes = [
  // ─── Routes publiques ───────────────────────────────────────────────────────
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: "/signup",
    name: "SignUp",
    component: SignUpView,
    meta: { requiresGuest: true },
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPasswordView,
    // Accessible sans être connecté (lien email) ET connecté (changement de mdp)
  },

  // ─── Routes protégées ───────────────────────────────────────────────────────
  {
    path: "/",
    name: "Dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },

  // ─── Fallback ───────────────────────────────────────────────────────────────
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || "/"),
  routes,
});

// ─── Navigation Guard ────────────────────────────────────────────────────────
router.beforeEach(async (to, from, next) => {
  // Récupère la session Supabase courante
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = !!session;

  // Route protégée → redirige vers /login si non connecté
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: "Login", query: { redirect: to.fullPath } });
  }

  // Route invité uniquement → redirige vers / si déjà connecté
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: "Dashboard" });
  }

  next();
});

export default router;
