import isString from 'lodash/isString'
/**
 * str.toUpperCase
 * @param {string} str
 * @return {string}
 */
function upper(str) {
    return makeString(str).toUpperCase()
}
/**
 * str.toLowerCase
 * @param {string} str
 * @return {string}
 */
function lower(str) {
    return makeString(str).toLowerCase()
}
/**
 * 如果给的是分隔符， 则分隔符左右分开
 * 如果给的是分割index， 则按index分开
 * @param {string} str
 * @param {string|number} separator
 * @return {{left:string,right:string}}
 * @author liqiang9521@foxmail.com
 */
function split2LeftRight(str, separator) {
    let index = separator
    if (isString(separator)) {
        index = str.indexOf(separator)
    }
    let left = str.substring(0, index)
    let right
    if (isString(separator)) {
        right = str.substring(index + 1)
    } else {
        right = str.substring(index)
    }
    return { left, right }
}

/**
 * @param {*} o
 * @return {string}
 * @author liqiang9521@foxmail.com
 */
function makeString(o) {
    return isString(o) ? o : JSON.stringify(o)
}

/**
 * 是否为空白字符串
 * @param {string} val
 * @return {boolean} 如果是空白串，返回true， 否则返回false
 * @author liqiang9521@foxmail.com
 */
function isBlank(val) {
    if (val === null || val === undefined) {
        return true
    }
    if (!isString(val)) {
        return false
    }
    return /^\s$/.test(val) || '' === val
}

export { upper, lower, split2LeftRight, isBlank }
