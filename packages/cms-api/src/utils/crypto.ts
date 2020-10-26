import crypto from 'crypto'
import { getEnvIdString } from './cloudbase'
import { dateToNumber } from './date'

export const genPassword = async function (
  originPassword: string,
  createTime: number
): Promise<string> {
  const envId = getEnvIdString()

  const salt = `${createTime}${envId}`

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
