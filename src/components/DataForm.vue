<template lang="pug">
el-form(:model="data" label-position="right" label-width="100px")
  el-form-item(v-for="key of Object.keys(data)" :label="key" :key="key")
    el-input(v-model="data[key]" :type="data[key].length < 50? 'text': 'textarea'" autosize)
el-form#add-form(:model="temp")
  el-form-item#key-input
    el-input(v-model="temp.key")
  el-form-item#value-input
    el-input(v-model="temp.value")
  el-form-item
    el-button(type="primary" @click="addAttribute" icon="el-icon-plus" circle plain)
</template>

<script lang="ts" setup>
import { ref, defineProps } from 'vue'
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
const temp = ref({
  key: '',
  value: ''
})
function addAttribute() {
  const data = props.data
  const key = temp.value.key
  const value = temp.value.value
  if (key === '' || value === '') return 
  data[key] = value
}
</script>

<style scoped>
#add-form {
  display: flex;
}
#key-input {
  width: 90px;
}
#value-input {
  flex: 1;
  margin: 0 10px;
}
</style>
