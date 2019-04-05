import Koa from 'koa'
import Application from './application'
/**
 *  service controller logic 的基类， 每个请求进来之后，都会在对应的ctx上设置app
 *  依次下去的controller就可以通过ctx上的app获取到对应的其他属性了
 *  这些属性只读， 设置时报错，暂时未填入报错信息
 *
 * @author liqiang9521@foxmail.com
 */
class BaseCtxClass {
    /**
     * 初始化
     * @param {{ctx:Koa.Context,app:Application}} a
     * @author liqiang9521@foxmail.com
     */
    constructor({ ctx, app, controllers, services, logics, } = {}) {
        this.ctx = ctx
        this.app = app
        this.controllers = controllers
        this.services = services
        this.logics = logics
    }
}

export default BaseCtxClass
