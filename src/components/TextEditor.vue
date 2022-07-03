<template lang="pug">
div#we(ref="we")
</template>

<script lang="ts" setup>
import Editor from 'wangeditor'
import i18next from 'i18next'
import { defineProps, defineEmits, onMounted, ref } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
})
const emit = defineEmits(['update:text', 'addImage'])

let editor: Editor
const we = ref<HTMLElement>()
function createEditor(text: string) {
  if (editor) editor.destroy()
  editor = new Editor(we.value)
  editor.config.menus = [
    'head',
    'bold',
    'italic',
    'underline',
    'strikeThrough',
    'quote',
    'list',
    'splitLine',
    'indent',
    'justify',
    'image',
    'undo',
    'redo',
  ]
  editor.config.lang = 'en'
  editor.i18next = i18next
  editor.config.showFullScreen = false
  editor.config.showMenuTooltips = false
  editor.config.placeholder = ''
  editor.config.zIndex = 50
  editor.config.showLinkImg = false
  editor.config.uploadImgMaxLength = 1
  editor.config.customUploadImg = async (
    files: File[],
    insertImage: (arg0: string) => void
  ) => {
    const file = files[0]
    const url = URL.createObjectURL(file)
    insertImage(url)
    emit('addImage', file, url)
  }
  editor.create()
  editor.txt.html(text)
  editor.config.zIndex = 1
  editor.config.onchange = () => {
    emit('update:text', editor.txt.html())
  }

  setTimeout(() => {
    editor.history.observe()
  }, 100)
}

onMounted(() => {
  createEditor(props.text)
})
</script>

<style scoped>
#we {
  display: flex;
  flex-direction: column;
  height: 100%;
}
:deep(.w-e-text-container) {
  flex: 1;
  overflow-y: scroll;
  text-align: justify;
  display: flex;
  justify-content: center;
  background-color: #eee;
}
:deep(.w-e-text) {
  overflow: initial;
  max-width: 40em;
  background-color: #fff;
  margin: 1em 0;
  height: fit-content !important;
  padding: 2em;
}
</style>
