import { isFunction, isObject, isArray } from 'lodash'
import csurf from './csurf'
import singleSignOn from './single-sign-on'
// import koaProxy from './proxy'
let middlewares = []
middlewares.push(csurf)
middlewares.push(singleSignOn)
// middlewares.push(koaProxy)

export const addMiddlewares = (...mws) => middlewares.push(...mws)

/**
 * @param {object} app
 *
 * @author liqiang9521@foxmail.com
 */
export default function install(app) {
    let logger = app.getLogger()
    middlewares.forEach((mw) => {
        let name = mw.middlewareName
        if (isObject(mw) && isFunction(mw.install)) {
            let conf = app.getMiddlewareConf(name)
            if (conf === false) {
                logger.info(`Disable middleware [${name}] with conf 'false'`)
            } else {
                logger.info(`Enable middleware [${name}]`)
                mw.install(app, conf)
            }
        } else {
            logger.warn(`can't install middleware [${mw.name ? mw.name : mw}]`)
        }
    })
}
