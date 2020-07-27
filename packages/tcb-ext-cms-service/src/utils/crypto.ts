import crypto from 'crypto'

export const genPassword = async function (originPassword: string, salt: string) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(originPassword, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) {
        reject(err)
      } else {
        resolve(derivedKey.toString('hex'))
      }
    })
  })
}
