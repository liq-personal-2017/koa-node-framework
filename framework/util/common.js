// import { last } from 'lodash'
/**
 * 模仿 oracle 的 decode 函数 ， 避免太多 if else 的问题
 * @param {*} val
 * @return {*}
 * @author liqiang9521@foxmail.com
 */
function decode(val, ...args) {
    let i = 0

    let length = args.length
    if (length == 0) {
        return val
    }
    while (i < length) {
        if (val === args[i]) {
            return args[i + 1]
        }
        i += 2
    }
    if (i > length) {
        return args.pop()
    }
    return val
}


export { decode }
