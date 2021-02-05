import { message } from 'antd'

/**
 * 从输入字符串中解析号码列表
 */
export const resolveAndCheckPhoneNumbers = (phoneNumbers: string): string[] | undefined => {
  if (phoneNumbers.includes('\n') && phoneNumbers.includes(',')) {
    message.error('请勿混用换行和英文分号 ,')
    return
  }

  let phoneNumberList: string[] = [phoneNumbers]

  if (phoneNumbers.includes('\n')) {
    phoneNumberList = phoneNumbers
      .split('\n')
      .filter((_) => _)
      .map((num) => num.trim())
  }
  if (phoneNumbers.includes(',')) {
    phoneNumberList = phoneNumbers
      .split(',')
      .filter((_) => _)
      .map((num) => num.trim())
  }

  if (!phoneNumberList?.length) {
    message.error('号码不能为空')
    return
  }

  // 去重
  phoneNumberList = phoneNumberList.filter((num, i, arr) => arr.findIndex((_) => _ === num) === i)

  return phoneNumberList
}
