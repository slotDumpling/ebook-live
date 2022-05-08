<template lang="pug">
button(@click="add")
  | Add
button(@click="remove")
  | Remove
transition-group(name="list-complete")
  span.list-complete-item(v-for="item in items" :key="item")
    | {{ item }}
</template>

<script lang="ts" setup>
import { reactive } from '@vue/reactivity'
const items = reactive([1, 2, 3, 4, 5, 6, 7, 8, 9])
let nextNum = 10
function randomIndex() {
  return Math.floor(Math.random() * items.length)
}
function add() {
  items.splice(randomIndex(), 0, nextNum++)
}
function remove() {
  items.splice(randomIndex(), 1)
}
</script>

<style scoped>
.list-complete-item {
  transition: all 0.8s ease;
  display: inline-block;
  margin-right: 10px;
}

.list-complete-enter-from,
.list-complete-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-complete-leave-active {
  position: absolute;
}
</style>
