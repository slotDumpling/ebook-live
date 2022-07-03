export default class FileUrl {
  urlMap: Record<string, string>
  pathMap: Record<string, string>
  constructor() {
    this.urlMap = {}
    this.pathMap = {}
  }
  set(filePath: string, url: string) {
    this.urlMap[filePath] = url
    this.pathMap[url] = filePath
  }
  setUrl(path: string, blob: Blob) {
    this.set(path, URL.createObjectURL(blob))
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
