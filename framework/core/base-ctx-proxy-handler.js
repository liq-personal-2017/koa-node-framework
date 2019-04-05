/**
 * 在 controller 中， 调用 this.service.User 时， 并没有 User 的实例， 调用时即时创建对应的Service实例，
 * 基础类， 带ctx 的集合类型的proxy， 通过代理， 即时创建， 节省性能， 避免创建一堆
 *
 * @author liqiang9521@foxmail.com
 */
class BaseCtxProxyHandler {
    /**
     * @param {Set} clazzSet
     * @param {any} param
     * @author liqiang9521@foxmail.com
     */
    constructor(clazzSet) {
        this.classes = new Map()
        this.classNames = []
        this.param = null
        Array.from(clazzSet).forEach((c) => {
            let name = c.name
            this.classNames.push(name)
            this.classes.set(name, c)
        })
    }
    /**
     * 代理 get
     * @param {object} target
     * @param {string} key
     * @param {Proxy} receiver
     * @return {any}
     * @author liqiang9521@foxmail.com
     */
    get(target, key, receiver) {
        let instance = Reflect.get(target, key)
        if (instance) {
            return instance
        }
        if (this.classNames.includes(key)) {
            let Clazz = this.classes.get(key)
            let instance = Reflect.construct(Clazz, [ this, ])
            target[key] = instance
            return instance
        }
        return null
    }
}

export default BaseCtxProxyHandler
