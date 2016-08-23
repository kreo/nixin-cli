// ----------------------------------------------------------------------
// Sass
// ----------------------------------------------------------------------

/*jshint esversion: 6 */

module.exports = (gulp, config, utils, $, _) => {

    // Dependencies
    // ---------------------------------------------------------

    // extending module dependencies with project dependencies
    // using $ as alias
    _.extend($, {
        sass: require("gulp-sass"),
        autoprefixer: require("gulp-autoprefixer"),
        sourcemaps: require("gulp-sourcemaps"),
        cssGlobbing: require('gulp-css-globbing'),
        cached: require("gulp-cached"),
        buffer: require("vinyl-buffer"),
        mirror: require("gulp-mirror"),
        cssnano: require("gulp-cssnano")
    });

    // Config
    // ---------------------------------------------------------

    // merging project plugins with default module plugins
    // and assign to use option
    var plugins = [].concat(config.npm.sass);

    // extending default config with project config
    _.extend(config.sass = {
        source: ["/styles"],
        dest: "",
        inputExt: "{sass,scss}",
        outputExt: "{css,css.map,css.gz}",
        opts: {
            includePaths: plugins,
            indentedSyntax: true,
            precision: 10,
            outputStyle: "expanded",
            importer: []
        }
    });

    // Public Methods
    // ---------------------------------------------------------

    function clean() {
        gulp.task("clean:sass", () => {
            $.del(utils.setCleanStack("sass", config.app));
        });
    }

    function create() {
        gulp.task("sass", ["clean:sass"], (cb) => {
            return gulp.src(utils.setSourceStack("sass", config.sass.inputExt))
                .pipe($.cached(config.dest, {
                    extension: '.css'
                }))
                .pipe($.buffer())
                .pipe($.sourcemaps.init({loadMaps: true}))
                .pipe($.cssGlobbing({
                    extensions: ['.scss', '.sass']
                }))
                .pipe($.sass(config.sass.opts), (res) => {
                    $.gutil.log("in result");
                    console.log(res);
                    res.on("end", () => {
                        console.log('res.end');
                        cb();
                    });
                    res.on("data", () => {
                        console.log("res.data");
                    });
                }).on("error", (e) => {
                    $.gutil.log("in error");
                    cb(e);
                })
                .pipe($.autoprefixer(config.autoprefixer))
                .pipe($.rename((filepath) => {
                    utils.rewritePath(filepath, config.app);
                }))
                .pipe(utils.addSuffixPath())
                .pipe($.if(!process.isProd, $.sourcemaps.write(config.sourcemaps)))
                .pipe($.if(process.isProd, $.mirror(
                    $.cssnano(),
                    $.cssnano().pipe($.gzip())
                )))
                .pipe(gulp.dest(config.dest))
                .pipe($.size({
                    showFiles: true
                }))
                .pipe($.if(process.isProd, $.browserSync.reload({
                    stream: true
                })));
        });
    }

    // API
    // ---------------------------------------------------------

    return {
        clean: clean(),
        create: create()
    };

};
