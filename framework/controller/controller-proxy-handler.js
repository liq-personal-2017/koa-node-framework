import BaseCtxProxyHandler from '../core/base-ctx-proxy-handler'
/**
 * 代理 处理函数
 *
 * @author liqiang9521@foxmail.com
 */
class ControllerProxyHandler extends BaseCtxProxyHandler {
    /**
     * @param {Set<Function>} clazzSet
     *
     * @author liqiang9521@foxmail.com
     */
    constructor(clazzSet) {
        super(clazzSet)
        this.controllers = null
        this.services = null
        this.app = null
        this.ctx = null
    }
}
export default ControllerProxyHandler
