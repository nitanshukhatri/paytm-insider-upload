function resizeCrop(src, width, height) {
  var crop = width === 0 || height === 0
  // not resize
  if (src.width <= width && height === 0) {
    width = src.width
    height = src.height
  }
  // resize
  if (src.width > width && height === 0) {
    height = src.height * (width / src.width)
  }

  // check scale
  var xscale = width / src.width
  var yscale = height / src.height
  var scale = crop ? Math.min(xscale, yscale) : Math.max(xscale, yscale)
  // create empty canvas
  var canvas = document.createElement("canvas")
  canvas.width = width ? width : Math.round(src.width * scale)
  canvas.height = height ? height : Math.round(src.height * scale)
  canvas.getContext("2d").scale(scale, scale)
  // crop it top center
  canvas
    .getContext("2d")
    .drawImage(src, (src.width * scale - canvas.width) * -0.5, (src.height * scale - canvas.height) * -0.5)
  return canvas
}

function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString
  if (dataURI.split(",")[0].indexOf("base64") >= 0) byteString = atob(dataURI.split(",")[1])
  else byteString = unescape(dataURI.split(",")[1])

  // separate out the mime component
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  return new Blob([ia], { type: mimeString })
}

export { resizeCrop, dataURItoBlob }
