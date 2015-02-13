module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            react: {
                files: 'common/**/*.js',
                tasks: ['shell','browserify']
            }
        },

        shell: {
            compileJSX: {
                command: './node_modules/.bin/jsx common/components/ lib/components/'
            } 
        },

        browserify: {
            options: {
                transform: [ require('grunt-react').browserify ]
            },
            client: {
                src: ['lib/**/*.js'],
                dest: 'public/js/bundle.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('default', [
        'browserify',
        'shell'
    ]);
};
