const merge = require('merge')
let config = require('../.eslintrc')
module.exports = merge(config, {})
module.exports.rules['require-jsdoc'] = 0
module.exports.rules['prefer-spread'] = 0
module.exports.rules['prefer-rest-params'] = 0

