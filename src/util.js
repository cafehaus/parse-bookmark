const fs  = require('node:fs')

/**
 * 判断文件是否存在
 * @param path
 * @returns {Boolean}
 */
function isFileExist(path) {
  try {
    let stat = fs.lstatSync(path)
    return stat && stat.isFile()
  } catch (r) {
    // console.log(r)
    return false
  }
}

/**
 * 判断目录是否存在
 * @param path
 * @returns {Boolean}
 */
function isDirExist(path) {
  try {
    let stat = fs.lstatSync(path)
    return stat && stat.isDirectory()
  } catch (r) {
    // console.log(r)
    return false
  }
}

module.exports = {
  isFileExist,
  isDirExist
}
