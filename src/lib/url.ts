interface Strings {
  [propName: string]: string
}

export default class FileUrl {
  urlMap: Strings
  pathMap: Strings
  constructor() {
    this.urlMap = {}
    this.pathMap = {}
  }
  set(filePath: string, url: string) {
    this.urlMap[filePath] = url
    this.pathMap[url] = filePath
  }
  setUrls(imageList:{ path: string, blob: Blob }[]) {
    this.revoke()
    imageList.forEach(img => {
      this.set(img.path, URL.createObjectURL(img.blob))
    })
  }
  revoke() {
    Object.values(this.urlMap).forEach(window.URL.revokeObjectURL)
    this.urlMap = {}
    this.pathMap = {}
  }
}
