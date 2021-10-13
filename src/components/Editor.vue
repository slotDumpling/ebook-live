<template lang="pug">
section#container(v-loading="loading")
  aside
    .aside-box#input
      el-input(placeholder="请打开文件" v-model="fileObj.name")
        template(#append)
          el-button(icon="el-icon-folder-opened" @click="fakeUpload")
    .aside-box#buttons
      el-button(disabled round size="medium" icon="el-icon-circle-plus-outline") New
      el-button(round plain size="medium" type="primary" @click="saveFile" :loading="saving" icon="el-icon-folder-checked") Save
    .aside-box(v-if="fileObj.type === 'mobi'")
      mobi-alert
    el-scrollbar.aside-box#menu(:always="true" v-if="fileObj.type === 'epub'")
      el-menu(default-active="1-0" :key="fileObj.name")
        el-menu-item-group
          template(#title)
            i.el-icon-document
            span &nbsp;Text / XHTML
          el-menu-item(v-for="(filePath, index) of fileObj.textFileList" :key="index" :index="`1-${index}`" @click="switchTextFile(filePath)") {{ nav[filePath] || filePath.split('/').pop() }}
        el-menu-item-group
          template(#title)
            i.el-icon-brush
            span &nbsp;Stylesheet / CSS
          el-menu-item(v-for="(filePath, index) of fileObj.styleFileList" :key="index" :index="`2-${index}`" @click="switchStyleFile(filePath)") {{ filePath.split('/').pop() }}
        el-menu-item-group
          template(#title)
            i.el-icon-more-outline
            span &nbsp;Others
          el-menu-item(@click="switchMetadata" index="3") Metadata
  main
    keep-alive
      text-editor(v-model:text="editorText" @add-image="addImage" :key="fileObj.editedFilePath" v-if="fileObj.editedFileType === 'text'")
    code-editor(v-model:text="cssText" :key="fileObj.editedFilePath" v-if="fileObj.editedFileType === 'style'")
    data-form(v-bind:data="metadata" v-if="fileObj.editedFileType === 'metadata'")
input(type="file" ref="fileInput" accept=".epub, .mobi" v-show="false" @change="fileChange")
el-button.aside-button(@click="switchAside" circle icon="el-icon-menu" type="primary")
</template>

<script lang="ts" setup>
import { saveAs } from 'file-saver'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { EpubFile } from '../lib/epub'
import { MobiFile } from '../lib/mobi'
import { setStyle } from '../lib/css'
import FileUrl from '../lib/url'
import CodeEditor from './CodeEditor.vue'
import DataForm from './DataForm.vue'
import MobiAlert from './MobiAlert.vue'
import TextEditor from './TextEditor.vue'

interface Strings {
  [propName: string]: string
}

onMounted(async() => {
  const blob = await (await fetch('./demo.epub')).blob()
  const file = new File([blob], 'demo.epub')
  loadEpub(file)
})

const editorText = ref('')
async function addImage(file: File, url: string) {
  if (fileObj.type === 'epub') {
    const filepath = await epub.addImage(file)
    fileUrl.set(filepath, url)
  }
}

const fileInput = ref<HTMLElement>()
function fakeUpload(): void {
  (fileInput.value as HTMLElement).click()
}
function fileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  if (input.files === null || input.files.length === 0) return
  const file = input.files[0]
  if (file.type === 'application/epub+zip') {
    loadEpub(file)
  } else {
    loadMobi(file)
  }
}
let mobi: MobiFile
async function loadMobi(file: File) {
  mobi = new MobiFile(await file.arrayBuffer())
  console.log(mobi)
  fileObj.type = 'mobi'
  fileObj.name = file.name
  fileObj.files = []
  fileObj.textFileList = []
  fileObj.styleFileList = []
  fileObj.editedFilePath = file.name
  fileObj.editedFileType = 'text'
  fileUrl.setUrls(mobi.imageBlobs)
  mobi.updateImageSrc(fileUrl.urlMap)
  editorText.value = mobi.getText()
  setStyle('', '.w-e-text ')
}

let epub: EpubFile
const nav = ref<Strings>({})
const loading = ref(true)
const fileUrl = new FileUrl()
interface FileObj {
  name: string
  type: 'epub'|'mobi'
  files: string[]
  textFileList: string[]
  styleFileList: string[]
  editedFilePath: string
  editedFileType: 'text'|'style'|'metadata'
}
const fileObj: FileObj = reactive({
  name: '',
  type: 'epub',
  files: [],
  textFileList: [],
  styleFileList: [],
  editedFilePath: '',
  editedFileType: 'text'
})
async function loadEpub(file: File) {
  try {
    loading.value = true
    epub = new EpubFile(file)
    await epub.load()
    fileUrl.setUrls(epub.imageBlobs)
    nav.value = await epub.getNavFlat()
    fileObj.name = file.name
    fileObj.type = 'epub'
    fileObj.textFileList = epub.textFileList
    fileObj.styleFileList = epub.styleFileList
    fileObj.editedFilePath = ''
    await switchTextFile(fileObj.textFileList[0])
  } catch(e) {
    console.error(e)
    ElMessage.error('加载失败')
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 200)
  }
}



async function switchTextFile(filePath: string) {
  if (fileObj.editedFilePath !== '') await saveChange()
  await epub.updateImageSrc(filePath, fileUrl.urlMap)
  const text = await epub.getTextBody(filePath)
  editorText.value = text
  fileObj.editedFilePath = filePath
  fileObj.editedFileType = 'text'
  await parseStyle(filePath)
}

const cssText = ref('')
async function switchStyleFile(filePath: string) {
  await saveChange()
  cssText.value = await epub.getCssText(filePath)
  fileObj.editedFilePath = filePath
  fileObj.editedFileType = 'style'
}

async function parseStyle(filePath: string) {
  const cssList = await epub.getCssListOfTextFile(filePath)
  let styleText = ''
  for (let filePath of cssList) {
    styleText += (await epub.getCssText(filePath)) + '\n'
  }
  styleText += await epub.getInternalStyle(filePath)
  setStyle(styleText, '.w-e-text ')
}

const metadata = ref<Strings>({})
function switchMetadata() {
  metadata.value = epub.getMetadata()
  fileObj.editedFileType = 'metadata'
}

async function saveChange() {
  const filePath = fileObj.editedFilePath
  if (filePath === '') return
  const type = fileObj.editedFileType
  if (type === 'text') {
    const text = editorText.value
    await epub.saveTextFile(filePath, text, fileUrl.pathMap)
  } else if (type === 'style') {
    epub.saveStyleFile(filePath, cssText.value)
  } else if (type === 'metadata') {
    epub.saveMetadata(metadata.value)
  }
}

const saving = ref(false)
async function saveFile() {
  if (fileObj.type === 'mobi') {
    if (mobi === undefined) return
    const text = editorText.value
    mobi.setText(text)
    saveAs(mobi.saveFile(), 'test.mobi')
  } else {
    if (epub === undefined) return
    saving.value = true
    await saveChange()
    const blob = await epub.getBlob()
    saveAs(blob, fileObj.name)
    saving.value = false
  }
}

// responsive aside
const asideTransform = ref('translateX(-100%)')
function switchAside() {
  if (asideTransform.value === 'translateX(-100%)') {
    asideTransform.value = 'translateX(0)'
  } else {
    asideTransform.value = 'translateX(-100%)'
  }
}
</script>

<style scoped>
#container {
  height: 100%;
  display: flex;
  width: 100%;
  overflow-x: hidden;
}
aside {
  height: 100%;
  background-color: #ddd;
  width: 296px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  z-index: 100;
}
.el-input-group {
  width: 256px;
}
#input {
  padding: 20px 20px 0 20px;
}
#buttons {
  display: flex;
  justify-content: space-between;
  border-bottom: dashed #bbb 1px;
  padding: 10px 20px;
}
#menu {
  flex: 1;
  overflow: visible;
  width: fit-content;
  min-width: 250px;
  height: 0;
  padding: 10px 20px 10px 0;
}
.el-menu {
  border-right: none;
  background-color: transparent;
  margin: 0 20px;
}
.el-menu-item {
  width: 250px;
  overflow: hidden;
  z-index: 100;
}
.el-menu-item:hover {
  min-width: fit-content;
  background-color: #fff;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
}
:deep(#menu .el-scrollbar__bar.is-vertical) {
  right: initial;
  left: 288px;
}
.aside-button {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 100;
  display: none;
}
main {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 50;
  min-width: 300px;
  overflow-y: overlay;
  box-sizing: border-box;
  background-color: #eee;
}
@media screen and (max-width: 800px) {
  aside {
    position: fixed;
    transform: v-bind(asideTransform);
    transition: all 0.3s ease-out;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
  }
  .aside-button {
    display: initial;
  }
}
</style>
