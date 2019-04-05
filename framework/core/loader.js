/**
 * 从babel代码中扒下来的
 *   加载模块的方法： 支持 es6 模块和 commonjs 模块
 * @param {string} moduleName
 * @return {*}
 * @author liqiang9521@foxmail.com
 */
function requireModule(moduleName) {
    const obj = require(moduleName)
    if (obj && obj.__esModule) {
        return obj
    } else {
        let newObj = {}
        if (obj != null) {
            for (let key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]
            }
        }
        newObj.default = obj
        return newObj
    }
}

export { requireModule }
