import { request } from 'umi'

export async function getCmsNotices(startTime: number) {
  return request(`https://tcli.service.tcloudbase.com/cms-notice?startTime=${startTime}`, {
    prefix: '',
  })
}
