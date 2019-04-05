import assert from 'assert'
const defaultUnSafeHttpMethods = [ 'trace', 'track', 'options', ]
/**
 * 应用配置
 *
 * @author liqiang9521@foxmail.com
 */
class ApplicationOption {
    /**
     * @param {{baseDir:string,webContextPath:string,staticPath:string,staticPrefix:string,unSafeMethods:Array<string>,keys:Array<string>,configPath:string}} options
     * @author liqiang9521@foxmail.com
     */
    constructor({ baseDir, webContextPath = '/', unSafeMethods = defaultUnSafeHttpMethods, staticPath = '', staticPrefix = '/', keys, configPath, }) {
        assert(baseDir, 'You must provide option [baseDir] for application ')
        assert(keys, 'You must provide option [keys] for application ')
        assert(unSafeMethods.every((method) => defaultUnSafeHttpMethods.includes(method)), `unSafe http method must be one of [${defaultUnSafeHttpMethods}]`)
        this.baseDir = baseDir
        this.webContextPath = webContextPath
        this.staticPath = staticPath
        this.staticPrefix = staticPrefix || '/'
        this.unSafeMethods = unSafeMethods
        this.keys = keys
        this.configPath = configPath || this.baseDir
    }
}
export default ApplicationOption
