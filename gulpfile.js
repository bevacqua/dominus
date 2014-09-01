'use strict';

var prettyBytes = require('pretty-bytes');
var gzipSize = require('gzip-size');
var fs = require('fs');
var path = require('path');
var contra = require('contra');
var gulp = require('gulp');
var bump = require('gulp-bump');
var git = require('gulp-git');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var streamify = require('gulp-streamify');
var source = require('vinyl-source-stream');
var size = require('gulp-size');

var extended = [
  '/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''
].join('\n');

var succint = '// <%= pkg.name %>@v<%= pkg.version %>, <%= pkg.license %> licensed. <%= pkg.homepage %>\n';

function build (done) {
  var pkg = require('./package.json');

  browserify('./src/dominus.js')
    .bundle({ debug: true, standalone: 'dominus' })
    .pipe(source('dominus.js'))
    .pipe(streamify(header(extended, { pkg : pkg } )))
    .pipe(gulp.dest('./dist'))
    .pipe(streamify(rename('dominus.min.js')))
    .pipe(streamify(uglify()))
    .pipe(streamify(header(succint, { pkg : pkg } )))
    .pipe(streamify(size()))
    .pipe(gulp.dest('./dist'))
    .on('end', footprint.bind(null, done));
}

function bumpOnly () {
  var bumpType = process.env.BUMP || 'patch'; // major.minor.patch

  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({ type: bumpType }))
    .pipe(gulp.dest('./'));
}

function replaceFootprint (needle, relative, done) {
  var file = path.resolve(relative);
  var data = fs.readFileSync(file);
  var size = gzipSize.sync(data);
  var sizeHuman = prettyBytes(size).replace(/\s+/g, '');
  var readmeFile = path.resolve('./README.md');
  var readme = fs.readFileSync(readmeFile, { encoding: 'utf8' });
  var output = readme.replace(needle, '$1' + sizeHuman + '$3');

  fs.writeFile(readmeFile, output, { encoding: 'utf8'}, done);
}

function footprint (done) {
  var dominusNeedle = /(with a footprint of \*\*)(\S*)(\*\* minified and gzipped)/mig;
  var jqueryNeedle = /(vs the \*\*)(\S*)(\*\* in jQuery)/mig;

  contra.series([
    contra.curry(replaceFootprint, dominusNeedle, './dist/dominus.min.js'),
    contra.curry(replaceFootprint, jqueryNeedle, './node_modules/jquery/dist/jquery.min.js')
  ], done);
}

function tag () {
  var pkg = require('./package.json');
  var v = 'v' + pkg.version;
  var message = 'Release ' + v;

  return gulp.src('./')
    .pipe(git.commit(message))
    .pipe(git.tag(v, message))
    .pipe(git.push('origin', 'master', '--tags'))
    .pipe(gulp.dest('./'));
}

function publish (done) {
  require('child_process').exec('npm publish', { stdio: 'inherit' }, done);
}

gulp.task('clean', function () {
  gulp.src('./dist', { read: false })
    .pipe(clean());
});

gulp.task('footprint', footprint);
gulp.task('build', ['clean'], build);
gulp.task('bump', bumpOnly);
gulp.task('bump-build', ['bump'], build);
gulp.task('tag', ['bump-build'], tag);
gulp.task('npm', publish);
gulp.task('release', ['tag'], function () {
  gulp.start('npm');
});

