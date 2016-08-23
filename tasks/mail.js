// ----------------------------------------------------------------------
// Mail
// ----------------------------------------------------------------------

/*jshint esversion: 6 */

module.exports = (gulp, config, utils, $, _) => {

    // @TODO FIX ALL PATHS (testing)

    // Dependencies
    // ---------------------------------------------------------

    _.extend($, {
        stylus: require('gulp-stylus'),
        cached: require("gulp-cached"),
        buffer: require("vinyl-buffer"),
        inlineCss: require("gulp-inline-css"),
        inject: require("gulp-inject"),
        injectStyle: require("gulp-style-inject"),
        replace: require("gulp-replace"),
        autoprefixer: require("gulp-autoprefixer"),
        cssnano: require("gulp-cssnano"),
    });

    // Config
    // ---------------------------------------------------------

    _.extend(config.mail = {
        paths: ["/mail"],
    });



    function inlineStyles() {
        gulp.task("inline:mail.styles", () => {
            return gulp.src(config.source + config.mail.paths + "/markup/**/*.html")
                .pipe($.inject(
                    gulp.src(config.dest + "/mail.css", {
                        read: false
                    }), {
                        relative: true,
                        starttag: "<!-- inject:mail:{{ext}} -->"
                    }
                ))
                .pipe($.inlineCss({
                    applyStyleTags: true,
                    applyLinkTags: true,
                    removeStyleTags: true,
                    removeLinkTags: true
                }))
                .pipe(gulp.dest(config.dest + config.mail.paths + "/markup"))
                .pipe($.size({
                    showFiles: true
                }));
        });
    }

    function convertStyles() {
        gulp.task("convert:mail.styles", () => {
            return gulp.src(config.source + config.mail.paths + "/markup/**/*.html")
                .pipe($.replace(/<link.*?href="(.+?\.css)"[^>]*>/g, function(s, filename) {
                    var style = $.fs.readFileSync(filename, "utf8");
                    return "<style>\n" + style + "\n</style>";
                }))
                .pipe(gulp.dest(config.dest + config.mail.paths + "/markup"))
                .pipe($.size({
                    showFiles: true
                }));
        });
    }

    // Public
    // ---------------------------------------------------------

    function clean() {
        gulp.task("clean:mail", () => {
            $.del([
                config.dist + "/mail/markup",
                config.dist + "/mail/styles"
            ], {
                force: true
            });
        });
    }

    function createStyles() {
        gulp.task("create:mail.styles", () => {
            return gulp.src(config.source + config.mail.paths + "/styles/*.styl")
                .pipe($.cached(config.dest, {
                    extension: ".css"
                }))
                .pipe($.buffer())
                .pipe($.sourcemaps.init())
                .pipe($.stylus(config.stylus.opts))
                .pipe($.if(process.isProd, $.stylus(config.stylus.opts)))
                .on('error', utils.errors)
                .pipe($.autoprefixer(config.autoprefixer))
                .pipe($.rename({
                    basename: config.mail
                }))
                .pipe($.if(!process.isProd, $.sourcemaps.write(config.sourcemaps)))
                .pipe($.if(process.isProd, $.cssnano()))
                .pipe(gulp.dest(config.dest + config.mail.paths))
                .pipe($.size({
                    showFiles: true
                }))
                .pipe($.if(process.isProd, $.browserSync.reload({
                    stream: true
                })));
        });
    }

    function bundle() {
        gulp.task("mail", ["clean:mail"], () => {
            $.runSequence(
                'create:mail.styles',
                ['inline:mail.styles'],
                ['inject:mail.styles'],
                ['convert:mail.styles']
            );
        });
    }

    // API
    // ---------------------------------------------------------

    return {
        clean: clean(),
        inlineStyles: inlineStyles(),
        convertStyles: convertStyles(),
        createStyles: createStyles(),
        bundle: bundle()
    };
};
