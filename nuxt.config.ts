// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app/web/',
  pages: true,
  css: [
  '@unocss/reset/tailwind.css',
  '@unocss/reset/normalize.css',
  '@unocss/reset/eric-meyer.css',
  '@unocss/reset/sanitize/sanitize.css',
  '@unocss/reset/sanitize/assets.css',
  '@/assets/main.css',
  ],
  modules: [
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@nuxt/test-utils',
  '@unocss/nuxt',
  ],
})