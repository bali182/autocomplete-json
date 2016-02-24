const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');
const fs = require('fs');
const merge = require('merge2');
const babel = require('gulp-babel');

gulp.task('clean', [], () => {
  return del([
    'lib/**/*.js',
    'dist/**'
  ]);
});

gulp.task('build-ts', ['clean'], () => {
  const options = JSON.parse(fs.readFileSync('tsconfig.json', "utf8")).compilerOptions;
  const compile = ts(options);
  return gulp.src('lib/**/*.ts')
    .pipe(compile)
    .pipe(babel({ presets: ["es2015", "stage-0"] }))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-json', ['clean'], () =>
  gulp.src('lib/**/*.json')
    .pipe(gulp.dest('dist'))
);

gulp.task('build', ['build-ts', 'copy-json']);

gulp.task('watch', [], () =>
  gulp.watch(['lib/**/*.json', 'lib/**/*.ts'], ['build'])
);
