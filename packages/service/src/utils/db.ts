/**
 * 根据分页条件计算 skip
 * @param page
 * @param pageSize
 * @param offset
 */
export const getSkip = (page = 1, pageSize = 10, offset = 0) => {
  const skip = (Number(page) - 1) * Number(pageSize) - offset
  return skip >= 0 ? skip : 0
}

/**
 * 根据分页条件计算 limit
 * @param page
 * @param pageSize
 * @param offset
 */
export const getLimit = (page = 1, pageSize = 10, offset = 0) => {
  // 转换成 number
  const pageNum = Number(page)
  const pageSizeNum = Number(pageSize)

  // 当前分页情况，offset 到达的页数
  const splitPage = offset > 0 ? Math.ceil(offset / pageSizeNum) : 1
  // page 大于 splitPage，说明不需要从 offset 中补充，直接返回
  // 反之，返回需要从数据库中查询的条数
  return pageNum > splitPage ? pageSizeNum : pageSizeNum - (offset % pageSizeNum)
}
