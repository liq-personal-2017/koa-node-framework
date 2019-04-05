import BaseApplication from './base-application'
import install, { addMiddlewares } from '../middleware'
import session from 'koa-session'
import MemoryStore from 'koa-session-memory'
import { getLogger, connectLogger } from '../log'
import ApplicationOption from './application-option'
import koaBody from 'koa-body'
import assert from 'assert'
import { isFunction } from 'util'
import serve from 'koa-static'
import mount from 'koa-mount'
import compress from 'koa-compress'

/**
 * 基础类
 *  提供 getLogger 方法 ， 在 config 中配置的 logger ， 均可以通过 app.getLogger(name) 的方式来获取对应的实例
 *  提供 getPlugin 方法 ， 每个 plugin 实例都必须有一个 pluginName 的属性 ， 设置了该属性的 plugin ， 即可通过get方法获取， 否则需要自行保存引用
 * @author liqiang9521@foxmail.com
 */
class Application extends BaseApplication {
    /**
     * @param {ApplicationOption} options
     * @author liqiang9521@foxmail.com
     */
    constructor(options = {}) {
        super(options)

        this.createLoggers()
        this.logger = getLogger('app')
        this.plugins = Object.create(null)
        this.keys = this.options.keys

        this.init()
    }
    /**
     * 初始化
     *
     * @author liqiang9521@foxmail.com
     */
    init() {
        const store = new MemoryStore()
        const CONFIG = {
            key: this.keys /** (string) cookie key (default is koa:sess) */, // 除了这个参数之外，其他参数都是 cookie.set 时用的， 直接参考cookie.set api 即可
            /** (number || 'session') maxAge in ms (default is 1 days) */
            /** 'session' will result in a cookie that expires when session/browser is closed */
            /** Warning: If a session cookie is stolen, this cookie will never expire */
            maxAge: 86400000,
            // secure: true,
            autoCommit: true /** (boolean) automatically commit headers (default true) */,
            overwrite: true /** (boolean) can overwrite or not (default true) */,
            httpOnly: true /** (boolean) httpOnly or not (default true) */,
            signed: true /** (boolean) signed or not (default true) */,
            rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
            renew: true /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/,
            store,
        }
        this.closeUnSafeHttpMethods()
        this.use(async (ctx, next) => {
            ctx.app = this
            await next()
        })
        this.use(compress())
        this.use(koaBody())

        let httpLogger = getLogger('http')._logger
        this.use(connectLogger(httpLogger, { level: 'auto', }))
        this.use(session(CONFIG, this))
        let plugins = this.config.plugins
        if (plugins && plugins.length > 0) {
            let p
            assert(plugins.every((plugin) => ((p = plugin), isFunction(plugin.install))), `Each plugin shuld has a install method [${p && (p.pluginName || p.name || p)}]`)
            for (let plugin of plugins) {
                plugin.install(this)
                let name = plugin.pluginName
                this.logger.info(`Installed plugin [${name}]`)
                if (name) {
                    Reflect.set(this.plugins, name, plugin)
                }
            }
        }

        let middlewares = this.config.middlewares
        if (middlewares && middlewares.length > 0) {
            addMiddlewares(...middlewares)
        }

        install(this)
        this.logger.info(`App WebContextPath [${this.webContextPath}]`)
        if (this.options.staticPath) {
            this.serveStatic(this.options.staticPrefix, this.options.staticPath)
        }
        this.loadControllers()
        this.use(this.contextRouter.routes()).use(this.contextRouter.allowedMethods())
    }
    /**
     * 静态资源管理
     * @param {string} prefix
     * @param {string} dirPath
     * @author liqiang9521@foxmail.com
     */
    serveStatic(prefix, dirPath) {
        this.logger.info(`Serve static with prefix [${prefix}] : dirPath [${dirPath}]`)
        let m = mount(this.webContextPath, mount(prefix, serve(dirPath)))
        this.use(m)
    }

    /**
     * @param {string} name
     * @return {*} 返回对应名称的配置： 如果没有配置，则返回 undefined
     * @author liqiang9521@foxmail.com
     */
    getMiddlewareConf(name) {
        if (this.config.app && this.config.app.middleware) {
            let conf = Reflect.get(this.config.app.middleware, name)
            return conf
        }
    }

    /**
     * 获取插件
     * @param {string} name
     * @return {*} 返回对应名称的插件实例
     * @author liqiang9521@foxmail.com
     */
    getPlugin(name) {
        let plugin = Reflect.get(this.plugins, name)
        if (plugin) {
            return plugin
        }
        throw new Error(`can't find plugin[${name}] in this application, you might forget to put it in the config; please check config.js`)
    }
}

export default Application
