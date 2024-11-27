<script setup lang="ts">

</script>
<template>
    <h1 v-if="$pwa?.isPWAInstalled">PWA instalada!</h1>
    <h2 v-else>PWA no instalada</h2>
</template>


<style scoped>
h1 {
    color: #42b983;
}
</style>