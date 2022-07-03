<template>
  <h1>{{ value }}</h1>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const value = ref('apple')
</script>

<style scoped></style>
