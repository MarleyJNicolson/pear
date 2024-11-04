// nuxt.config.ts
export default defineNuxtConfig({
  css: [
    'vuetify/styles', // Include Vuetify styles
    '@mdi/font/css/materialdesignicons.css', // Include Material Design Icons for Vuetify
  ],

  build: {
    transpile: ['vuetify'], // Ensure Vuetify is transpiled
  },

  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },

  compatibilityDate: '2024-09-25',
  modules: ['@nuxt/icon'],
})