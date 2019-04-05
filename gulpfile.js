const gulp = require('gulp')

process.env.NODE_ENV = 'production' // 设置环境变量， 不要动

const babel = require('gulp-babel')
const globby = require('globby')
const del = require('del')
// const babelConf = require('./.babelrc.node')
async function cleanLib() {
    await del('./lib/*')
}

async function build() {
    let files = await globby('./framework')
    let jsfiles = []
    let otherfiles = []
    files.forEach(file => {
        if (file.endsWith('.js')) {
            jsfiles.push(file)
        } else {
            otherfiles.push(file)
        }
    })
    return Promise.all([
        new Promise((resolve, reject) => {
            gulp.src(jsfiles, { base: './framework' })
                .pipe(babel())
                .pipe(gulp.dest('./lib'))
                .on('end', function() {
                    resolve()
                })
                .on('error', error => {
                    reject(error)
                })
        }),
        new Promise((resolve, reject) => {
            gulp.src(otherfiles, { base: './framework' })
                .pipe(gulp.dest('./lib'))
                .on('end', () => {
                    resolve()
                })
                .on('error', error => {
                    reject(error)
                })
        })
    ])
}

gulp.task('default', gulp.series(cleanLib, build))
