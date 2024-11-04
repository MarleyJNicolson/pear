<template>
  <div id="app">
    <NuxtLayout>
      <v-app>
        <NuxtPage />
      </v-app>
    </NuxtLayout>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        message: 'Hello, Vue!',
        counter: 0
      };
    },
    methods: {
      incrementCounter() {
        this.counter++;
      }
    }
  }
</script>


