<template lang="pug">
div#cm(ref="cm")
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/css/css'
const props = defineProps({
  text: String
})
const emit = defineEmits(['update:text'])
const cm = ref<HTMLElement>()
let myCodeMirror: codemirror.Editor

onMounted(() => {
  myCodeMirror = codemirror(cm.value as HTMLElement, {
    value: props.text,
    mode:  "css",
    lineNumbers: true,
    viewportMargin: Infinity
  })
  myCodeMirror.on('change', (e: codemirror.Editor) => {
    emit('update:text', e.getValue())
  })
})
</script>

<style scoped>
#cm {
  margin: 30px;
}
:deep(.CodeMirror) {
  font-family: Consolas, Monaco, monospace;
  height: auto;
}
</style>