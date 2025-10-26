import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import SignIn from '../pages/SignIn.vue';
import SignUp from '../pages/SignUp.vue';
import ActivateAccount from '../pages/ActivateAccount.vue';
import ForgotPassword from '../pages/ForgotPassword.vue';
import ResetPassword from '../pages/ResetPassword.vue';
import Terms from '../pages/Terms.vue';
import Dashboard from '../pages/Dashboard.vue';
import Settings from '../pages/Settings.vue';
import NewTransactions from '../pages/NewTransactions.vue';
import Transactions from '../pages/Transactions.vue';
import Analytics from '../pages/Analytics.vue';


const routes = [
  { path: '/walle/', name: '/', component: Home },
  { path: '/walle/home', name: 'Home', component: Home },
  { path: '/walle/signin', name: 'Sign In', component: SignIn },
  { path: '/walle/signup', name: 'Sign Up', component: SignUp },
  { path: '/walle/terms', name: 'Terms', component: Terms },
  { path: '/walle/activate', name: 'Activate Account', component: ActivateAccount },
  { path: '/walle/forgot-password', name: 'Forgot Password', component: ForgotPassword },
  { path: '/walle/reset-password', name: 'Reset Password', component: ResetPassword },

  // Rotas protegidas (necessitam de autenticação)
  { path: '/walle/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true },
    children: [
        { path: "settings", name: "Settings", component: Settings, meta: { requiresAuth: true } },
        { path: "new-transactions", name: "New Transactions", component: NewTransactions, meta: { requiresAuth: true } },
        { path: "transactions", name: "Transactions", component: Transactions, meta: { requiresAuth: true } },
        { path: "analytics", name: "Analytics", component: Analytics, meta: { requiresAuth: true } },
      ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔐 Verificação global de autenticação
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/walle/home');
  } else {
    next();
  }
});

export default router;
