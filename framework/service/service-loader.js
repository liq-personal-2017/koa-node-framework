import fs from 'fs'
import path from 'path'

import Application from './../core/application'
import { requireModule } from '../core/loader'
/**
 * 服务加载器
 *
 * @author liqiang9521@foxmail.com
 */
class ServiceLoader {
    /**
     * @param {{app:Application,baseDir:string}} opt
     *
     * @author liqiang9521@foxmail.com
     */
    constructor(opt = {}) {
        let { baseDir, app, } = opt
        this.baseDir = baseDir
        this.app = app
        this._app = app
        this.clazzSet = new Set()
        this.init()
    }
    /**
     * 全路径
     * @param {string} p
     * @return {string}
     * @author liqiang9521@foxmail.com
     */
    resovle(p) {
        return path.join(this.baseDir, 'services', p)
    }
    /**
     * 初始化
     *
     * @author liqiang9521@foxmail.com
     */
    init() {
        if (fs.existsSync(this.resovle(''))) {
            const files = fs.readdirSync(this.resovle('')).map((file) => this.resovle(file))
            for (const file of files) {
                if (fs.statSync(file).isFile()) {
                    this.clazzSet.add(requireModule(file).default)
                }
            }
        }
    }
}

export default ServiceLoader
