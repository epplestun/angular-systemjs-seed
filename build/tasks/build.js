var gulp = require('gulp');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var less = require('gulp-less');
var lessPluginCleanCSS = require("less-plugin-clean-css");
var htmlMin = require('gulp-minify-html');
var ngHtml2Js = require("gulp-ng-html2js");
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var path = require('path')

var paths = require('../paths');
var compilerOptions = require('../babel-options');

var cleancss = new lessPluginCleanCSS({
  advanced: true,
  keepSpecialComments: 0,
  keepBreaks: false
});

gulp.task('build', function (callback) {
  return runSequence(
    'clean',
    ['less', 'html', 'es6', 'move'],
    callback
  );
});

gulp.task('es6', function () {
  return gulp.src(paths.source, { base: 'src' })
    .pipe(plumber())
    .pipe(changed(paths.output, { extension: '.js' }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(babel(compilerOptions))
    .pipe(ngAnnotate({
      sourceMap: true,
      gulpWarnings: false
    }))
    .pipe(sourcemaps.write("/sourcemaps", { sourceRoot: '/src' }))
    .pipe(gulp.dest(paths.output))
});

gulp.task('html', function () {
  return gulp.src(paths.templates)
    .pipe(plumber())
    .pipe(changed(paths.output, { extension: '.html' }))
    .pipe(htmlMin({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(ngHtml2Js({
      template: "import angular from 'angular';\n" +
        "export default angular.module('<%= moduleName %>', []).run(['$templateCache', function($templateCache) {\n" +
        "   $templateCache.put('<%= template.url %>',\n    '<%= template.prettyEscapedContent %>');\n" +
        "}]);\n"
    }))
    .pipe(babel(compilerOptions))
    .pipe(gulp.dest(paths.output))
});

gulp.task('less', function () {
  return gulp.src(path.less)
    .pipe(plumber())
    .pipe(changed(path.output, {extension: '.css'}))
    .pipe(sourcemaps.init())
    .pipe(less({
      plugins: [ cleancss ]
    }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(path.output))
    .pipe(browserSync.reload({ stream: true }));
});