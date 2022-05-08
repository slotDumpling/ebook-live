import JSzip from 'jszip'
import _ from 'lodash'

function rel2abs(base: string, relative: string): string {
  const stack = base.split('/').slice(0, -1)
  const parts = relative.split('/')
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] == '.') continue
    if (parts[i] == '..') stack.pop()
    else stack.push(parts[i])
  }
  return stack.join('/')
}
function abs2rel(base: string, absolute: string) {
  const baseParts = base.split('/').slice(0, -1)
  const parts = absolute.split('/')
  while (baseParts[0] === parts[0]) {
    baseParts.shift()
    parts.shift()
  }
  let relParts: string[] = new Array(baseParts.length).fill('..')
  relParts = relParts.concat(parts)
  return relParts.join('/')
}
function getPath(filePath: string): string {
  let path = filePath.split('/').slice(0, -1).join('/')
  if (path !== '') path += '/'
  return path
}
function getListPath(fileList: string[]): string {
  // get the most frequent path of the file list.
  const paths = fileList.map(getPath)
  let path = _.head(_(paths).countBy().entries().maxBy(_.last)) as string
  return path
}

type StringRec = Record<string, string>

interface imageBlob {
  path: string
  blob: Blob
}

class EpubFile {
  zip: JSzip
  loaded: boolean
  dp: DOMParser
  file?: File
  name: string
  fileList: string[]
  textFileList: string[]
  textDocs: Record<string, Document>
  textPath: string
  styleFileList: string[]
  stylePath: string
  imageFileList: string[]
  imageBlobs: imageBlob[]
  imagePath: string
  opfFilePath: string
  opfDoc: Document
  ncxFilePath: string
  ncxDoc: Document
  constructor(file?: File) {
    this.zip = new JSzip()
    this.loaded = false
    this.dp = new DOMParser()
    this.name = ''
    this.fileList = []
    this.textFileList = []
    this.textPath = ''
    this.styleFileList = []
    this.stylePath = ''
    this.imageFileList = []
    this.imageBlobs = []
    this.imagePath = ''
    this.textDocs = {}
    this.opfFilePath = ''
    this.opfDoc = new Document()
    this.ncxFilePath = ''
    this.ncxDoc = new Document()
    if (file !== undefined) {
      this.file = file
      this.name = file.name
    }
  }
  async load() {
    if (this.loaded) return
    try {
      await this.loadAsZip()
      await this.parseOpf()
      await this.parseNcx()
      this.loaded = true
    } catch (e) {
      throw e
    }
  }
  async loadAsZip() {
    if (this.file === undefined) throw new Error('file not found.')
    this.zip = await JSzip.loadAsync(this.file)
    this.fileList = Object.keys(this.zip.files)
  }
  async getOpfFilePath(): Promise<string> {
    const fallback = (): string => {
      const path = this.fileList.find((name) => /[\s\S]+\.opf/g.test(name))
      if (path === undefined) throw new Error('opf filepath not found')
      return path
    }
    const containerFile = this.zip.file('META-INF/container.xml')
    if (containerFile === null) return fallback()
    const containerXml = await containerFile.async('text')
    const containerDoc = this.dp.parseFromString(containerXml, 'text/xml')
    const el = containerDoc.getElementsByTagName('rootfile')[0]
    if (el === undefined) return fallback()
    const path = el.getAttribute('full-path')
    if (path === null) return fallback()
    return path
  }
  async parseOpf() {
    // get the path to content.opf
    this.opfFilePath = await this.getOpfFilePath()
    const opfPath = getPath(this.opfFilePath)
    // get and parse content.opf to dom tree
    const opfFile = this.zip.file(this.opfFilePath)
    if (opfFile === null) throw new Error('opf file not found')
    const contentText = await opfFile.async('string')
    this.opfDoc = this.dp.parseFromString(contentText, 'text/xml')
    // get file paths listed in opf file
    const manifestEl = this.opfDoc.getElementsByTagName('manifest')[0]
    if (manifestEl === undefined)
      throw new Error('the opf file has no manifest')
    const fileList = [...manifestEl.children]
      .map((el) => el.getAttribute('href'))
      .filter((el) => el !== null) as string[]

    this.textFileList = fileList
      .filter((name) => /[\s\S]+\.(xhtml|html)/g.test(name))
      .map((name) => rel2abs(opfPath, name))
    this.textPath = getListPath(this.textFileList)
    // including styleSheets not listed in manifest.
    this.styleFileList = this.fileList.filter((name) =>
      /[\s\S]+\.css/g.test(name)
    )
    this.stylePath = getListPath(this.styleFileList)
    // including images not listed in manifest.
    this.imageFileList = this.fileList.filter((name) =>
      /[\s\S]+\.(png|jpe?g|gif|svg)/g.test(name)
    )
    this.imagePath = getListPath(this.imageFileList)
    for (let path of this.imageFileList) {
      this.imageBlobs.push({
        path: path,
        blob: await this.getImage(path),
      })
    }
  }
  async getTextDoc(filePath: string): Promise<Document> {
    if (this.textDocs[filePath] !== undefined) {
      return this.textDocs[filePath]
    }
    const textFile = this.zip.file(filePath)
    if (textFile === null) return new Document()
    const html = await textFile.async('string')
    const doc = this.dp.parseFromString(html, 'text/html')
    this.textDocs[filePath] = doc
    return doc
  }
  async updateImageSrc(filePath: string, urlMap: StringRec) {
    const doc = await this.getTextDoc(filePath)
    const imgEls = doc.getElementsByTagName('img')
    for (let el of imgEls) {
      let src = el.getAttribute('src')
      if (src === null) continue
      src = rel2abs(filePath, src)
      if (urlMap[src] === undefined) continue
      el.setAttribute('src', urlMap[src])
    }
  }
  async getTextBody(filePath: string): Promise<string> {
    const doc = await this.getTextDoc(filePath)
    return doc.body.innerHTML
  }
  getNcxFilePath(): string {
    const fallback = (): string => {
      const path = this.fileList.find((name) => /[\s\S]+\.ncx/g.test(name))
      if (path === undefined) throw new Error('ncx filepath not found')
      return path
    }
    const doc = this.opfDoc
    const el = doc.getElementById('ncx')
    if (el === null) return fallback()
    const path = el.getAttribute('href')
    if (path === null) return fallback()
    return rel2abs(this.opfFilePath, path)
  }
  async parseNcx() {
    this.ncxFilePath = this.getNcxFilePath()
    const ncxFile = this.zip.file(this.ncxFilePath)
    if (ncxFile === null) throw new Error('.ncx file not found')
    const ncxText = await ncxFile.async('text')
    this.ncxDoc = this.dp.parseFromString(ncxText, 'text/xml')
  }
  async getNavFlat(): Promise<StringRec> {
    const doc = this.ncxDoc
    const navPoints = [...doc.getElementsByTagName('navPoint')]
    const nav: StringRec = {}
    navPoints.forEach((el) => {
      const text = el.getElementsByTagName('text')[0].innerHTML
      let filePath = el.getElementsByTagName('content')[0].getAttribute('src')
      if (filePath === null) return
      filePath = filePath.split('#')[0]
      filePath = rel2abs(this.ncxFilePath, filePath)
      nav[filePath] = text
    })
    return nav
  }
  getMetadata(): StringRec {
    const doc = this.opfDoc
    const metadataEl = doc.getElementsByTagName('metadata')[0]
    if (!metadataEl) return {}
    const metadata = [...metadataEl.children]
    const result: StringRec = {}
    metadata.forEach((el) => {
      let tag = el.tagName
      if (/dc:[\s\S]+/g.test(tag) === false) return
      tag = tag.slice(3)
      const text = el.innerHTML
      result[tag] = text
    })
    return result
  }
  async getCssListOfTextFile(filePath: string): Promise<string[]> {
    const doc = await this.getTextDoc(filePath)
    const cssList = [...doc.getElementsByTagName('link')]
      .map((e) => {
        const path = e.getAttribute('href')
        if (path === null) return ''
        return path
      })
      .filter((p) => p !== '')
      .map((p) => rel2abs(filePath, p))
    return cssList // with full path
  }
  async getInternalStyle(filePath: string): Promise<string> {
    const doc = await this.getTextDoc(filePath)
    const styleEls = [...doc.getElementsByTagName('style')]
    if (styleEls.length === 0) return ''
    const styleText = styleEls
      .map((el) => el.innerHTML)
      .reduce((t0, t1) => `${t0}\n${t1}`)
    return styleText
  }
  async getCssText(filePath: string): Promise<string> {
    const cssFile = this.zip.file(filePath)
    if (cssFile === null) return ''
    return await cssFile.async('string')
  }
  async getImage(filePath: string) {
    const file = this.zip.file(filePath)
    if (file === null) throw new Error('file not found')
    return file.async('blob')
  }
  async addImage(file: File): Promise<string> {
    if (!this.loaded) return ''
    const name = file.name
    const type = file.type
    const filePath = this.imagePath + name
    this.zip.file(filePath, file)
    const doc = this.opfDoc as Document
    const manifest = doc.getElementsByTagName('manifest')[0]
    const item = doc.createElement('item')
    item.setAttribute('href', abs2rel(this.opfFilePath, filePath))
    item.setAttribute('media-type', type)
    manifest.appendChild(item)
    return filePath
  }
  async saveTextFile(filePath: string, bodyText: string, pathMap: StringRec) {
    const doc = await this.getTextDoc(filePath)
    doc.body.innerHTML = bodyText
    const imgElements = doc.getElementsByTagName('img')
    for (let el of imgElements) {
      let src = el.getAttribute('src')
      if (src === null) continue
      if (pathMap[src] === undefined) continue
      src = abs2rel(filePath, pathMap[src])
      el.setAttribute('src', src)
    }
    const text = doc.documentElement.outerHTML
    this.zip.file(filePath, text)
  }
  saveStyleFile(filePath: string, text: string) {
    this.zip.file(filePath, text)
  }
  async saveOpfFile() {
    const text = this.opfDoc.documentElement.outerHTML as string
    this.zip.file(this.opfFilePath, text)
  }
  async saveMetadata(data: StringRec) {
    const keys = Object.keys(data)
    const doc = this.opfDoc
    let metadataEl = doc.getElementsByTagName('metadata')[0] as Element
    if (metadataEl === undefined) {
      const newEl = doc.createElement('metadata')
      doc.appendChild(newEl)
      metadataEl = newEl
    }
    for (let key of keys) {
      const tag = `dc:${key}`
      const el = doc.getElementsByTagName(tag)[0]
      if (el === undefined) {
        const newEl = doc.createElement(tag)
        newEl.innerHTML = data[key]
        metadataEl.appendChild(newEl)
      } else {
        el.innerHTML = data[key]
      }
    }
  }
  async getBlob() {
    this.saveOpfFile()
    return await this.zip.generateAsync({ type: 'blob' })
  }
}

export { EpubFile }
