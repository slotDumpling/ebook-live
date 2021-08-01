interface PDBHeader {
  name: string
  fileAttributes: number
  version: number
  creationTime: number
  modificationTime: number
  backupTime: number
  modificationNumber: number
  appinfo: number
  sortinfo: number
  type: string
  creator: string
  uid: number
  nextRecordList: number
  numRecords: number
}
interface PalmHeader {
  compression: number
  unused: number
  textLength: number
  recordCount: number
  recordSize: number
  currentPosition: number
  encryptionType: number
  begin: number
  end: number
}
interface record {
  offset: number
  attribute: number
}
interface MobiHeader {
  identifier: string
  headerLength: number
  mobiType?: number
  textEncoding?: number
  uid?: number
  fileVersion?: number
  firstNonBookindex?: number
  fullNameOffset?: number
  fullNameLength?: number
  Locale?: number
  inputLanguage?: number
  outputLanguage?: number
  minVersion?: number
  firstImageRec?: number
  huffmanRecordOffset?: number
  huffmanRecordCount?: number
  huffmanTableOffset?: number
  huffmanTableLength?: number
  exthFlags?: number
  drmOffset?: number
  drmCount?: number
  drmSize?: number
  drmFlags?: number
  firstContentRec?: number
  lastContentRec?: number
  extraflags?: number
  indexRecOffset?: number
  begin: number
  end?: number
}
interface exth {
  type: number
  data: string | number
}
interface IndexHeader {
  identifier: string
  headerLength: number
  indexType: number
  unknown1: number
  unknown2: number
  idxtStart: number
  indexRecCount: number
  indexEncoding: number
  indexLang: number
  indexEntryCount: number
  ordtStart: number
  ligtStart: number
  ligtNum: number
  nctoc: number
}
interface Tagx {
  identifier: string
  headerLength: number
  ctrlByteCount: number
  tagTable: {
    tag: number,
    valueNum: number,
    mask: number,ctrlByteEnd: number
  }[]
}
interface imageBlob {
  path: string
  blob: Blob
}
interface Strings {
  [propName: string]: string
}

const endingBuffer = new Uint8Array([0x46, 0x4c, 0x49, 0x53, 0x00, 0x00, 0x00, 0x08, 0x00, 0x41, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x00, 0x01, 0x00, 0x03, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0xff, 0xff, 0xff, 0xff, 0x46, 0x43, 0x49, 0x53, 0x00, 0x00, 0x00, 0x14, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0f, 0x88, 0xbb, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x08, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0xe9, 0x8e, 0x0d, 0x0a])

const numberExthTypes = [115, 116, 121, 125, 131, 200, 201, 202, 203, 204, 205, 206, 207, 300]

class MobiFile {
  view: DataView
  buffer: Uint8Array
  offset: number
  pdbHeader: PDBHeader
  palmHeader: PalmHeader
  mobiHeader: MobiHeader
  recordList: record[]
  exthList: exth[]
  content: string
  doc: Document
  indexRecords?: Uint8Array[]
  imageBlobs: imageBlob[]

  constructor(data: ArrayBuffer | Uint8Array) {
    this.view = new DataView(data)
    this.buffer = new Uint8Array(data)
    this.offset = 0
    this.pdbHeader = this.loadPdbHeader()
    this.recordList = this.loadRecordList()
    this.palmHeader = this.loadPalmHeader()
    this.mobiHeader = this.loadMobiHeader()
    this.exthList = this.loadExthHeader()
    this.content = this.loadText()
    this.loadIndex()
    this.doc = new DOMParser().parseFromString(this.content, 'text/html')
    this.imageBlobs = this.loadImages()
  }
  private loadPdbHeader(): PDBHeader {
    return {
      name: this.getStr(32),
      fileAttributes: this.getUint16(),
      version: this.getUint16(),
      creationTime: this.getUint32(),
      modificationTime: this.getUint32(),
      backupTime: this.getUint32(),
      modificationNumber: this.getUint32(),
      appinfo: this.getUint32(),
      sortinfo: this.getUint32(),
      type: this.getStr(4),
      creator: this.getStr(4),
      uid: this.getUint32(),
      nextRecordList: this.getUint32(),
      numRecords: this.getUint16(),
    }
  }
  private loadRecordList(): record[] {
    let recList: Array<record> = new Array()
    for (let i = 0; i < this.pdbHeader.numRecords; i++) {
      recList.push({
        offset: this.getUint32(),
        attribute: this.getUint32()
      })
    }
    return recList
  }
  private loadPalmHeader(): PalmHeader {
    const record_1 = this.recordList[0]
    this.offset = record_1.offset
    return {
      begin: this.offset,
      compression: this.getUint16(),
      unused: this.getUint16(),
      textLength: this.getUint32(),
      recordCount: this.getUint16(),
      recordSize: this.getUint16(),
      currentPosition: this.getUint16(),
      encryptionType: this.getUint16(),
      end: this.offset
    }
  }
  private loadMobiHeader(): MobiHeader {
    const start = this.offset
    let result: MobiHeader = {
      begin: this.offset,
      identifier: this.getStr(4),
      headerLength: this.getUint32(),
      mobiType: this.getUint32(),
      textEncoding: this.getUint32(),
      uid: this.getUint32(),
      fileVersion: this.getUint32()
    }

    this.offset += 40
    result.firstNonBookindex = this.getUint32()
    result.fullNameOffset = this.getUint32()
    result.fullNameLength = this.getUint32()
    result.Locale = this.getUint32()
    result.inputLanguage = this.getUint32()
    result.outputLanguage = this.getUint32()
    result.minVersion = this.getUint32()
    result.firstImageRec = this.getUint32()
    result.huffmanRecordOffset = this.getUint32()
    result.huffmanRecordCount = this.getUint32()
    result.huffmanTableOffset = this.getUint32()
    result.huffmanTableLength = this.getUint32()
    result.exthFlags = this.getUint32()

    this.offset += 36
    result.drmOffset = this.getUint32()
    result.drmCount = this.getUint32()
    result.drmSize = this.getUint32()
    result.drmFlags = this.getUint32()
// 58
    this.offset += 8
    result.firstContentRec = this.getUint16()
    result.lastContentRec = this.getUint16()
    this.offset += 44

    result.extraflags = this.getUint32()
    result.indexRecOffset = this.getUint32()

    this.offset = start + result.headerLength
    return result
  }
  private loadExthHeader(): exth[] {
    const id = this.getStr(4)
    if (id !== 'EXTH') return []
    const headerLen = this.getUint32()
    let count = this.getUint32()

    const result: exth[] = []
    while(count > 0) {
      const type = this.getUint32()
      const len = this.getUint32() - 8
      let data: string | number = ''
      if (numberExthTypes.includes(type) && len === 4) {
        data = this.getUint32()
      } else {
        data = this.getStr(len)
      }
      result.push({ type, data })
      count--
    }
    return result
  }
  private loadText(): string {
    const count = this.palmHeader.recordCount
    const texts: Uint8Array[] = []
    let size = 0
    const flags = this.mobiHeader.extraflags as number
    for (let i = 1; i <= count; i++) {
      let data = this.buffer.slice(this.recordList[i].offset, this.recordList[i+1].offset)

      // trim off the extra parts
      const extraSize = getExtraSize(data, flags)
      data = data.slice(0, data.length - extraSize)

      if (this.palmHeader.compression === 2) {
        data = lz77(data)
      }
      
      size += data.byteLength
      texts.push(data)
    }
    const textBuffer = new Uint8Array(size)
    let offset = 0
    texts.forEach(data => {
      textBuffer.set(data, offset)
      offset += data.byteLength
    })
    let content = parseText(textBuffer)
    return content
  }
  private loadIndex(): void {
    const index = this.mobiHeader.indexRecOffset
    // 0xffffffff means no index
    if (index === undefined || index === 0xffffffff) return
    // load the index header
    const start = this.offset = this.recordList[index].offset
    let identifier = this.getStr(4)
    if (identifier !== 'INDX') return
    const indexHeader: IndexHeader = {
      identifier,
      headerLength: this.getUint32(),
      indexType: this.getUint32(),
      unknown1: this.getUint32(),
      unknown2: this.getUint32(),
      idxtStart: this.getUint32(),
      indexRecCount: this.getUint32(),
      indexEncoding: this.getUint32(),
      indexLang: this.getUint32(),
      indexEntryCount: this.getUint32(),
      ordtStart: this.getUint32(),
      ligtStart: this.getUint32(),
      ligtNum: this.getUint32(),
      nctoc: this.getUint32()
    }
    this.offset = start + indexHeader.headerLength

    // load the tagx
    const tagx: Tagx = {
      identifier: this.getStr(4),
      headerLength: this.getUint32(),
      ctrlByteCount: this.getUint32(),
      tagTable: []
    }
    for (let i = 0; i < (tagx.headerLength - 12) / 4; i++) {
      tagx.tagTable.push({
        tag: this.getUint8(),
        valueNum: this.getUint8(),
        mask: this.getUint8(),
        ctrlByteEnd: this.getUint8()
      })
    }
    // console.log(indexHeader, tagx)

    const imageIndex = this.mobiHeader.firstImageRec as number
    const indexRecords: Uint8Array[] = []
    for (let i = index; i < imageIndex; i++) {
      indexRecords.push(this.buffer.slice(this.recordList[i].offset, this.recordList[i+1].offset))
    }
    this.indexRecords = indexRecords
  }
  private loadImages(): imageBlob[] {
    const imageBlobs: imageBlob[] = []
    const first = this.mobiHeader.firstImageRec as number
    const last = this.mobiHeader.lastContentRec as number
    for (let i = first; i < last; i++) {
      const begin = this.recordList[i].offset
      const end = this.recordList[i+1].offset
      const blob = new Blob([this.buffer.slice(begin, end)])
      imageBlobs.push({
        path: String(i - first + 1).padStart(5, '0'),
        blob
      })
    }
    return imageBlobs
    // const imgEls = [...this.doc.getElementsByTagName('img')]
    // imgEls.forEach(el => {
    //   const recindex = el.getAttribute('recindex')
    //   // recindex starts with '00001'
    //   if (recindex === null) return
    //   const index = parseInt(recindex)
    //   const start = this.mobiHeader.firstImageRec as number
    //   const begin = this.recordList[start + index - 1].offset
    //   const end = this.recordList[start + index].offset
    //   const blob = new Blob([this.buffer.slice(begin, end)])
    //   imageBlobs[index] = blob
    // })
  }
  updateImageSrc(urlMap: Strings) {
    const imgEls = [...this.doc.getElementsByTagName('img')]
    imgEls.forEach(el => {
      const recindex = el.getAttribute('recindex')
      if (recindex === null) return
      const src = urlMap[recindex]
      if (src === null) return
      el.setAttribute('src', src)
    })
  }
  getText(): string {
    return this.doc.body.innerHTML
  }
  setText(bodyText: string) {
    this.doc.body.innerHTML = bodyText
  }
  saveFile() {
    const text = this.doc.documentElement.outerHTML
    const textBf = new TextEncoder().encode(text)
    const textLen = textBf.length
    // set record buffer
    const headerLen = this.recordList[1].offset - this.recordList[0].offset
    // including mobi and exth header

    const {
      recordList: recList,
      textRecNum: textRecNum,
      indexRec: indexRec,
      firstImageRec: firstImageRec,
      lastContentRec: lastContentRec,
      flisRec: flisRec,
      fcisRec: fcisRec,
      eofRec: eofRec
    } = setRecList(headerLen, textLen, this.indexRecords as Uint8Array[], this.imageBlobs)

    const recBf = recList2Buffer(recList)
    
    // set pdb header
    let pdbBf = this.buffer.slice(0, 78).buffer
    const pdbDv = new DataView(pdbBf)
    // PDBHeader: Record number; offset: 76
    pdbDv.setUint16(76, recList.length)
    pdbBf = pdbDv.buffer

    // set palm, mobi, exth... header in one buffer
    let headerBf = this.buffer.slice(this.palmHeader.begin, this.recordList[1].offset).buffer
    const headerDv = new DataView(headerBf)
    // PalmHeader: compression; 1 means no compression; offset: 0
    headerDv.setUint16(0, 1)
    // PalmHeader: text length; offset: 4
    headerDv.setUint32(4, textLen)
    // PalmHeader: text record number; offset: 8
    headerDv.setUint16(8, textRecNum)
    // MobiHeader: first image record index; offset: 108
    headerDv.setUint32(108, firstImageRec)
    // MobiHeader: last content record index; offset: 194
    headerDv.setUint16(194, lastContentRec)
    // MobiHeader: fcis record index; offset: 200
    headerDv.setUint32(200, fcisRec)
    // MobiHeader: flis record index; offset: 208
    headerDv.setUint32(208, flisRec)
    // MobiHeader: extra record data flag; offset: 240
    headerDv.setUint32(240, 1)
    // MobiHeader: INDX record offset; offset: 244
    headerDv.setUint32(244, indexRec)
    headerBf = headerDv.buffer

    // get total image buffer
    const nonBookStart = this.mobiHeader.firstNonBookindex as number
    const begin = this.recordList[nonBookStart].offset
    const imageBf = this.buffer.slice(begin)

    return new Blob([pdbBf, recBf, headerBf, textBf, imageBf])
  }
  private getUint8(): number {
    const result = this.view.getUint8(this.offset)
    this.offset += 1
    return result
  }
  private getUint16(): number {
    const result = this.view.getUint16(this.offset)
    this.offset += 2
    return result
  }
  private getUint32(): number {
    const result = this.view.getUint32(this.offset)
    this.offset += 4
    return result
  }
  private getStr(size: number): string {
    let str = parseText(this.buffer.slice(this.offset, this.offset + size))
    this.offset += size
    return str
  }
}

function parseText(buffer: Uint8Array): string {
  return new TextDecoder('utf-8').decode(buffer)
}

function getExtraSize(data: Uint8Array, flags: number): number {
  var pos = data.length - 1;
  var extra = 0;
  for (var i = 15; i > 0; i--) {
    if (flags & (1 << i)) {
      var res = buffergetvarlen(data, pos);
      var size = res[0];
      var l = res[1];
      pos = res[2];
      pos -= size - l;
      extra += size;
    }
  }
  if (flags & 1) {
    var a = data[pos];
    extra += (a & 0x3) + 1;
  }
  return extra;
}

function buffergetvarlen(data: Uint8Array, pos: number): number[] {
  var l = 0;
  var size = 0;
  var bytecount = 0;
  var mask = 0x7f;
  var stopflag = 0x80;
  var shift = 0;
  for (var i = 0; ; i++) {
    var byte = data[pos];
    size |= (byte & mask) << shift;
    shift += 7;
    l += 1;
    bytecount += 1;
    pos -= 1;

    var tostop = byte & stopflag;
    if (bytecount >= 4 || tostop > 0) {
      break;
    }
  }
  return [size, l, pos];
}

function lz77(buffer: Uint8Array): Uint8Array {
  const newBuffer = new Uint8Array(buffer.length * 8)
  let offset1 = 0
  let offset2 = 0
  while (offset1 < buffer.length) {
    let c = buffer[offset1++]
    if (c === 0x00 || (c >= 0x09 && c <= 0x7f)) {
      // copy 1 literal
      newBuffer[offset2++] = c
    } else if (c >= 0x01 && c <= 0x08) {
      for (let j = 0; j < c && offset1 + j < buffer.length; j++) {
        newBuffer[offset2++] = buffer[offset1 + j]
      }
      offset1 += c
    } else if (c >= 0x80 && c <= 0xbf) {
      // (this + next) byte = 2bits + distance(11 bits) + length(3bits)
      if (offset1 > buffer.length) break
      c = (c << 8) | buffer[offset1++]
      const length = (c & 0x0007) + 3
      const distance = (c >> 3) & 0x7ff
      if (distance <= 0 || distance > offset2) break
      for (let j = 0; j < length; j++) {
        const index = offset2 - distance
        newBuffer[offset2++] = newBuffer[index]
      }
    } else if (c >= 0xc0) {
      newBuffer[offset2++] = 32
      newBuffer[offset2++] = c ^ 0x80
    } else {
      // unknown input
    }
  }
  return newBuffer.slice(0, offset2)
}

function setRecList(headerLen: number, textLen: number, indexRecords: Uint8Array[], imageBlobs: imageBlob[]) {
  const result: record[] = []
  // records: 1 * header + text records + image records + FLIS + FCIS + EOF
  const textRecNum = Math.ceil(textLen / 4096)
  const num = textRecNum + imageBlobs.length + indexRecords.length + 4
  let offset = 8 * num + 2 + 78

  function pushRec(len: number): void {
    result.push({ offset, attribute: result.length * 2 })
    offset += len
  }
  pushRec(headerLen)
  while (textLen > 0) {
    pushRec(Math.min(4096, textLen))
    textLen -= 4096
  }
  indexRecords.forEach(b => {
    pushRec(b.length)
  })
  imageBlobs.forEach(b => {
    pushRec(b.blob.size)
  })
  pushRec(36)
  pushRec(44)
  pushRec(4)
  return ({
    recordList: result,
    textRecNum,
    indexRec: textRecNum + 1,
    firstImageRec: textRecNum + indexRecords.length + 1,
    lastContentRec: result.length - 4,
    flisRec: result.length - 3,
    fcisRec: result.length - 2,
    eofRec: result.length - 1
  })
}

function recList2Buffer(recList: record[]): ArrayBuffer {
  // record = 4 bytes offset + 1 byte attribute + 3 bytes UID
  // record list ends with 2 zero bytes as gap.
  const length = 8 * recList.length + 2
  const dataview = new DataView(new ArrayBuffer(length))
  let offset = 0
  recList.forEach(record => {
    dataview.setUint32(offset, record.offset)
    dataview.setUint32(offset + 4, record.attribute)
    offset += 8
  })
  return dataview.buffer
}

export { MobiFile }