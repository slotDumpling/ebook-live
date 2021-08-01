function addPrepend(text: string, prepend: string): string {
  const doc = new Document().implementation.createHTMLDocument('')
  const styleNode = document.createElement('style')
  styleNode.innerText = text
  doc.body.appendChild(styleNode)
  return [...(styleNode.sheet?.cssRules as CSSRuleList)]
    .map(e => `${prepend}` + e.cssText)
    .join('\n')
}
function clearStyle() {
  const styleNode = document.getElementById('book-css')
  if (styleNode === null) return
  document.head.removeChild(styleNode)
}
function setStyle(styleText: string, prepend: string) {
  clearStyle()
  styleText = addPrepend(styleText, prepend)
  const styleNode = document.createElement('style')
  styleNode.setAttribute('id', 'book-css')
  styleNode.innerText = styleText
  document.head.appendChild(styleNode)
}
export { setStyle }