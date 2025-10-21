import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import SignIn from '../pages/SignIn.vue';
import SignUp from '../pages/SignUp.vue';
import ActivateAccount from '../pages/ActivateAccount.vue';
import ForgotPassword from '../pages/ForgotPassword.vue';
import ResetPassword from '../pages/ResetPassword.vue';

const routes = [
  { path: '/walle/home', name: 'Home', component: Home },
  { path: '/walle/signin', name: 'Sign In', component: SignIn },
  { path: '/walle/signup', name: 'Sign Up', component: SignUp },
  { path: '/walle/activate', name: 'Activate Account', component: ActivateAccount },
  { path: '/walle/forgot-password', name: 'Forgot Password', component: ForgotPassword },
  { path: '/walle/reset-password', name: 'Reset Password', component: ResetPassword },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔐 Verificação global de autenticação
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/walle/home'); // Redireciona se não estiver logado
  } else {
    next(); // Continua normalmente
  }
});

export default router;
