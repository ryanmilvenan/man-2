var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    nodemon     = require('gulp-nodemon');

gulp.task('browser-sync', ['develop'], function() {
    browserSync({
        proxy: "http://localhost:3000",
        files: ['public/**/*.*', './*.js'],
        port:7000
    });

});

gulp.task('develop', function(cb) {
    return nodemon({ script: 'server.js', ext: 'html js'})
    .on('start', function() {
    });
});

gulp.task('default', ['browser-sync'], function() {

});
