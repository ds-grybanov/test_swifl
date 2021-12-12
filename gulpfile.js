const {src, dest, series, watch} = require('gulp');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const include = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const del = require('del');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const sync = require('browser-sync').create();
const ttf2woff = require('gulp-ttf2woff');
const imagemin = require('gulp-imagemin');

function html() {
  return src('src/**.html')
    .pipe(include({
      prefix: '@@'
    }))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest('dist'))
}

function fonts() {
  return src('src/fonts/*.ttf')
        .pipe(ttf2woff())
        .pipe(dest('dist/fonts'));
}

function images(){
  return src('src/img/**/*')
      .pipe(imagemin([
          imagemin.gifsicle({interlaced: true}),
          imagemin.mozjpeg({quality: 75, progressive: true}),
          imagemin.optipng({optimizationLevel: 5}),
          imagemin.svgo({
              plugins: [
                  {removeViewBox: true},
                  {cleanupIDs: false}
              ]
          })
      ]))
      .pipe(dest('dist/img'))
}

function scss() {
  return src('src/scss/**.scss')
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions']
    }))
    .pipe(csso())
    .pipe(concat('style.min.css'))
    .pipe(dest('dist/css'))
}

function clear() {
  return del('dist')
}

function serve() {
  sync.init({
    server: './dist'
  })

  watch('src/**.html', series(html)).on('change', sync.reload)
  watch('src/scss/**/*.scss', series(scss)).on('change', sync.reload)
  watch('src/img/**/*', series(images)).on('change', sync.reload)
}

exports.build = series(clear, scss, fonts, images, html)
exports.serve = series(clear, scss, images, html, serve)
exports.clear = clear