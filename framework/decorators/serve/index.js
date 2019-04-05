/**
 * requestmapping
 *  映射注解 以及 对应的映射关系
 *  暂时没什么好办法存储：
 *      在本地有两个map来存储这些对应关系
 *      --也可以通过symbol来注册到clazz和method身上，然后提供特定的方法来提取对应的属性，这里为了简单，暂时就这么做了，以后需要调整也是可以的
 * @author liqiang9521@foxmail.com
 */
import assert from 'assert'
import { isString, isObject } from 'lodash'

const METHODS = ['post', 'get', 'put', 'delete', 'patch']
// {clazz url}
const clazzMappingMap = new Map()
// {clazz {method mapping}}
const clazzMethodsMappingMap = new Map()

/**
 * 映射关系参数
 *
 * @author liqiang9521@foxmail.com
 */
class Mapping {
    /**
     * 构造函数
     * @constructor
     * @param {string|Mapping} mapping 字符串
     * @author liqiang9521@foxmail.com
     */
    constructor(mapping) {
        assert(validMapping(mapping), 'request-mapping value must be string or object {url:string,method(s):"post"/"get"/"put"/"delete"/"patch"}')
        if (isString(mapping)) {
            this.url = mapping
            this.method = ['all']
        } else {
            let { url, method, } = mapping
            this.url = url
            this.method = method.split(',')
        }
    }
}
/**
 * 给class加添映射关系
 * @param {string} value
 * @param {object} target
 * @author liqiang9521@foxmail.com
 */
function mapClass(value, target) {
    assert(isString(value), 'class mapping must be string')
    clazzMappingMap.set(target, value)
}
/**
 * 给method添加映射关系
 * @param {Mapping} mapping
 * @param {Object} target Class.prototype
 * @param {string} key Class.prototype.methodName
 * @author liqiang9521@foxmail.com
 */
function mapMethod(mapping, target, key /* , descriptor*/) {
    let clazz = target.constructor
    let map = getMethodsMap(clazz)
    map.set(key, mapping)
}
/**
 * 获取方法映射关系map：可能没有，没有的话创建新的
 * @param {function} clazz
 * @return {Map<Function,Map<Function,Mapping>>} 集合
 * @author liqiang9521@foxmail.com
 */
function getMethodsMap(clazz) {
    let map = clazzMethodsMappingMap.get(clazz)
    if (!map) {
        map = new Map()
        clazzMethodsMappingMap.set(clazz, map)
    }
    return map
}
/**
 * 校验配置
 * @param {string|object} value
 * @return {boolean}
 * @author liqiang9521@foxmail.com
 */
function validMapping(value) {
    if (isString(value)) {
        return true
    }
    if (isObject) {
        return value != null && validMethod(value) && Reflect.has(value, 'url')
    }
    return false
}
/**
 * 校验httpMethod
 * @param {string|object} value
 * @return {boolean}
 * @author liqiang9521@foxmail.com
 */
function validMethod(value) {
    return (
        Reflect.has(value, 'method') &&
        isString(Reflect.get(value, 'method')) &&
        Reflect.get(value, 'method')
            .split(',')
            .every((method) => METHODS.includes(method))
    )
}
/**
 * 映射关系注解
 *  对于类注解
 *  value 只能是字符串
 *  对于方法注解
 *  value 的值可以给字符串或者对象
 *      如果为字符串，则 httpmethod默认为all
 *      如果为对象，则需要提供method/methods属性，指明这个方法处理的httpMethod
 * @param {string|Mapping} value
 * @return {function}
 * @author liqiang9521@foxmail.com
 */
function serve(value = '/') {
    return function(target, key, descriptor) {
        if (arguments.length == 3) {
            const mapping = new Mapping(value)
            return mapMethod(mapping, target, key, descriptor)
        } else if (arguments.length == 1) {
            return mapClass(value, target)
        } else {
            throw Error('Unkown mapping type')
        }
    }
}
/**
 *
 * @param {function} clazz
 * @return {Map<Function,string>|{ mapping:Map<Function,string>, methodsMapping:Map<Function,Mapping>}}
 * @author liqiang9521@foxmail.com
 */
function getClazzMapping(clazz) {
    if (clazz) {
        let mapping = clazzMappingMap.get(clazz)
        let methodsMapping = clazzMethodsMappingMap.get(clazz)
        return { mapping, methodsMapping, }
    }
    return clazzMappingMap
}

export { getClazzMapping }

export default serve
