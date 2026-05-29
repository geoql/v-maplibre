import type { RouterConfig } from '@nuxt/schema';

export default <RouterConfig>{
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, top: 96, behavior: 'smooth' };
    }
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
};
