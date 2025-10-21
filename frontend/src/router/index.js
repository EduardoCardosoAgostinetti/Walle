import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import SignIn from '../pages/SignIn.vue';
import SignUp from '../pages/SignUp.vue';
import ActivateAccount from '../pages/ActivateAccount.vue';

const routes = [
  { path: '/walle/home', name: 'Home', component: Home },
  { path: '/walle/signin', name: 'Sign In', component: SignIn },
  { path: '/walle/signup', name: 'Sign Up', component: SignUp },
  { path: '/walle/activate', name: 'Activate Account', component: ActivateAccount },
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
