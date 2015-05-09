var gulp        = require('gulp'),
    plugins     = require('gulp-load-plugins')({
                    pattern: ['gulp-*', 'gulp.*', 'browserify', 'reactify', 'uglifyify', 'envify', 'watchify'],
                    replaceString: /\bgulp[\-.]/
    }),
    dest        = 'public/',
    source      = require('vinyl-source-stream');

gulp.task('develop', ['browserify'], function(cb) {
    return plugins.nodemon({ script: 'server.js', ext: 'html js', tasks: ['browserify']})
    .on('start', function() {
    });
});

gulp.task('browserify', function() {
    var bundler = plugins.browserify({
        entries: ['./src/js/app.js'], // Only need initial file, browserify finds the deps
        transform: [plugins.reactify], // We want to convert JSX to normal javascript
        debug: true, // Gives us sourcemapping
        cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
    });
    var watcher  = plugins.watchify(bundler);

    return watcher
        .on('update', function () { // When any files update
            var updateStart = Date.now();
            console.log('Updating!');
            watcher.bundle() // Create new bundle that uses the cache for high performance
            .pipe(source('bundle.js'))
           // .pipe(plugins.envify())
           // .pipe(plugins.uglify())
            .pipe(gulp.dest(dest+'scripts'));
            console.log('Updated!', (Date.now() - updateStart) + 'ms');
        })
        .bundle() // Create the initial bundle when starting the task
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(dest+'scripts'));
    //return plugins.browserify('./src/js/app.js')
    //    .transform(plugins.reactify)
    //    .debug(true)
    //    .transform(plugins.envify)
    //    .transform(plugins.uglifyify)
    //    .bundle()
    //    .pipe(source('bundle.js'))
    //    .pipe(gulp.dest(dest+'scripts'));
});

gulp.task('default', ['browserify','develop'], function() {

});
