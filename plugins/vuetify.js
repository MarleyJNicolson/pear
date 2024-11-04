// plugins/vuetify.js
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css' // Ensure icons are loaded

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true, // Enable SSR if needed
    components, // Ensure components are registered
    directives, // Ensure directives are registered
    theme: {
      defaultTheme: 'light',
    },
  })

  nuxtApp.vueApp.use(vuetify) // Register Vuetify with the Vue instance
})
