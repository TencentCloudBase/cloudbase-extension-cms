import QRCode from 'qrcode'

export const generateQRCode = async (text: string) => {
  try {
    return QRCode.toDataURL(text)
  } catch (err) {
    console.error(err)
    return ''
  }
}
