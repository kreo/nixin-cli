// ----------------------------------------------------------------------
// Webpack
// ----------------------------------------------------------------------


import jshint from 'gulp-jshint';
import jshintStylish from 'jshint-stylish';
import cached from 'gulp-cached';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import mirror from 'gulp-mirror';
import gzip from 'gulp-gzip';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';


module.exports = (gulp, config, kernel, $) => {

    'use strict';

    // Config
    // ---------------------------------------------------------

    // merging project plugins with default module plugins
    // and assign to use option
    let plugins = [].concat(config.plugins.webpack);

    // extending default config with project config
    Object.assign(config.webpack = {
        source: [`/${config.scripts}`],
        dest: "",
        inputExt: "js",
        outputExt: "{js,js.map,js.gz}",
        transform: plugins,
        debug: !process.isProd,
        uglify: config.uglify
    });

    // Public
    // ---------------------------------------------------------

    let clean = () => {
        gulp.task("clean:webpack", () => {
            $.del(kernel.setCleanStack("webpack", config.app));
        });
    };

    let create = () => {
        gulp.task('webpack', ["clean:webpack"], (cb) => {
            return gulp.src(kernel.setSourceStack("webpack", config.webpack.inputExt))
                .pipe(jshint())
                .pipe(jshint.reporter(jshintStylish))
                .pipe($.plumber())
                .pipe(webpackStream(config.webpack.opts, webpack))
                .pipe(cached(config.destPublicDir + config.dest, {
                    extension: '.js'
                }))
                .pipe(buffer())
                .pipe($.if(!process.isProd, sourcemaps.init({loadMaps: true})))
                .pipe($.rename((filepath) => {
                    kernel.rewritePath(filepath, config.app);
                }))
                .pipe($.if(!process.isProd, sourcemaps.write(config.sourcemaps)))
                .pipe($.if(process.isProd, uglify(config.webpack.uglify)))
                .pipe($.if(process.isProd, mirror(gzip())))
                .pipe(gulp.dest(config.destPublicDir + config.dest))
                .pipe($.size({
                    showFiles: true
                }))
                .pipe($.browserSync.reload({
                    stream: true
                }));
        });
    };


    // API
    // ---------------------------------------------------------

    return {
        clean: clean(),
        create: create()
    };
};
