const qs = require('querystring')
const { APP_URL } = process.env

module.exports = {
  pagination: (route, query, page, limit, count) => {
    page = +page
    const pageInfo = {
      count: 0,
      pages: 0,
      currentPage: +page,
      limitPerPage: +limit,
      nextLink: null,
      prevLink: null
    }
    pageInfo.count = count
    pageInfo.pages = Math.ceil(count / limit)
    const { pages, currentPage } = pageInfo
    if (currentPage < pages) {
      pageInfo.nextLink = `${APP_URL}${route}?${qs.stringify({ ...query, ...{ page: page + 1 } })}`
    }

    if (currentPage > 1) {
      pageInfo.prevLink = `${APP_URL}${route}?${qs.stringify({ ...query, ...{ page: page - 1 } })}`
    }
    return pageInfo
  }
}