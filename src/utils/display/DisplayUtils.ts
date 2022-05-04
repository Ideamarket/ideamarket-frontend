import DOMPurify from 'dompurify'

/**
 * @param text A string of text
 * @returns the text passed in, replacing any URLs with anchor tags for those URLs. Returns it all as string, even the HTML parts
 */
export const urlify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g

  return text.replace(urlRegex, function (url) {
    let hyperlink = url
    if (!hyperlink.match('^https?://')) {
      hyperlink = 'http://' + hyperlink
    }
    return DOMPurify.sanitize(
      `<a
        style="color: rgb(8 87 224);"
        href="${url}"
        rel="noopener" noreferrer
        target="_blank"
        onmouseover='this.style.textDecoration="underline"'
        onmouseout='this.style.textDecoration="none"'
      >${url}</a>`,
      { ADD_ATTR: ['target'] } // This makes it so sanitize does not remove target attribute
    )
  })
}
