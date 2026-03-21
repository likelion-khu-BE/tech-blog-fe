import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ArticlesPage from '../pages/ArticlesPage.vue'
import MemberPage from '../pages/MemberPage.vue'
import GenerationsPage from '../pages/GenerationsPage.vue'
import LegacyMemberPage from '../pages/LegacyMemberPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/articles', name: 'articles', component: ArticlesPage },
    { path: '/members/:id', name: 'member', component: MemberPage },
    { path: '/members', name: 'members-list', component: GenerationsPage },
    { path: '/legacy/:id', name: 'legacy-member', component: LegacyMemberPage },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
