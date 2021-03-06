// ----------------------------------------------------------------------
// Fonts
// ----------------------------------------------------------------------


module.exports = (gulp, config, kernel, $) => {

    'use strict';

    // Config
    // ---------------------------------------------------------

    // extending default config with project config
    Object.assign(config.fonts = {
        source: ["/" + config.fonts],
        dest: "/fonts",
        inputExt: "{ttf,eot,woff,woff2}",
        outputExt: "{ttf,eot,woff,woff2}",
        regExt: /\.(ttf|eot|woff|woff2)$/
    });

    // Public
    // ---------------------------------------------

    let clean = () => {
        gulp.task("clean:fonts", () => {
            $.del(kernel.setCleanStack("fonts"));
        });
    };

    let create = () => {
        gulp.task("fonts", ["clean:fonts"], () => {
            gulp.src(kernel.setSourceStack("fonts", config.fonts.inputExt))
                .pipe($.rename((filepath) => {
                    kernel.rewritePath(filepath);
                }))
                .pipe($.size({
                    showFiles: true
                }))
                .pipe(gulp.dest(config.destPublicDir + config.dest));
        });
    };

    // API
    // ---------------------------------------------------------

    return {
        clean: clean(),
        create: create()
    };
};
