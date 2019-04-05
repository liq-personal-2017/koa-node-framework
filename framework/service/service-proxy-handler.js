import BaseCtxProxyHandler from '../core/base-ctx-proxy-handler'
/**
 *
 *
 * @author liqiang9521@foxmail.com
 */
class ServiceProxyHandler extends BaseCtxProxyHandler {
    /**
     * @param {Set} clazzSet
     *
     * @author liqiang9521@foxmail.com
     */
    constructor(clazzSet) {
        super(clazzSet)
        // this.controllers = null
        this.services = null
        this.app = null
        this.ctx = null
    }
}

export default ServiceProxyHandler
