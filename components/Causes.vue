<template>
    <div class="cause">
        <h4>{{ item.name }}</h4>
    </div>
</template>

<script setup>
    const props = defineProps({
        item: Object,
    });
</script>

<style lang="scss">
    @use "~/assets/scss/causes.scss";
</style>