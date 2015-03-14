var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    nodemon     = require('gulp-nodemon')

gulp.task('browser-sync', function() {
    browserSync({
        proxy: "localhost:3000"
    });
});

gulp.task('develop', function() {
    nodemon({ script: 'server.js', ext: 'html js'})
    .on('restart', function() {
        console.log('restarted!')
    })
})

gulp.task('watch', function() {
    gulp.watch('public/css/*.css', ['browser-sync'])
    gulp.watch('public/scripts/*.js', ['browser-sync'])
    gulp.watch('./*.js', ['browser-sync'])
});

gulp.task('default', ['watch', 'develop']);
