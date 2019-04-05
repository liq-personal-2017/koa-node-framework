/**
 * 将数字前面补上0
 * (2,5) => '00002'
 *
 * @param {Number} i
 * @param {Number} length
 * @return {string}
 */
function fixInt(i, length) {
    let result = String(~~i)
    if (length > result.length) {
        result = '0'.repeat(length - result.length) + result
    }
    return result
}

export { fixInt }
