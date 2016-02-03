var gulp = require('gulp'),
    shell = require('gulp-shell'),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass'),
    cssImport = require('gulp-cssimport'),
    autoprefixer = require('gulp-autoprefixer'),
    uncss = require('gulp-uncss'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    glob = require('glob'),
    coffee = require('gulp-coffee'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    jpegtran = require('imagemin-jpegtran'),
    gifsicle = require('imagemin-gifsicle'),
    optipng = require('imagemin-optipng');

gulp.task('default', ['scripts', 'watch']);

gulp.task('watch', function () {
  gulp.watch(['scripts']);
});

/** jekyll build **/
gulp.task('jekyll', function() {
  return gulp.src('index.html', { read: false })
    .pipe(shell([
      'jekyll build'
  ]));
});

/** html min **/
gulp.task('minify', function() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'))
});

/** css min **/
gulp.task('css', ['jekyll'], function() {
   return gulp.src('css/style.scss')
       .pipe(sass())
       .pipe(cssImport())
       .pipe(autoprefixer())
       .pipe(uncss({
           html: glob.sync("_site/**/*.html"),
           ignore: [
               'label.active', 
               '.dark-mode', 
               'span.tweet-time',
               /(#|\.)(is-)/,
               /(#|\.)(has-)/,
               /(#|\.)(js-)/           
          ]
       }))
       .pipe(minifyCss({keepBreaks:false}))
       .pipe(rename('style.min.css'))
       .pipe(gulp.dest('_site/style/'));
});

/** js min **/
gulp.task('javascript', ['jekyll'], function() {
    return gulp.src('js/myapp.js', { read: false })
        .pipe(shell([
          'jspm install'
        ]));
        .pipe(shell([
          'jspm bundle-sfx js/myapp _site/js/steve.js --minify --no-mangle'
        ]));
});

/** coffee to js **/
gulp.task('scripts', function () {
   gulp.src('src/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest('./'));
});

/** imgage optimise **/
gulp.task('images', ['jekyll'], function () {
    return gulp.src('img/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant(), jpegtran(), optipng(), gifsicle()]
        }))
        .pipe(gulp.dest('_site/img'));
});

