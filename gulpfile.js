'use strict';

// Add reference to MS Engine that repleces all external names (localization files too)
const hackedExternals = require("@microsoft/sp-build-core-tasks/lib/webpack/LegacyExternals");

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

build.configureWebpack.mergeConfig({
    additionalConfiguration: function (cfg) {
        console.log("WEBPACK CONFIG MODIFICATION - REMOVE CONTENT HASH");
        // Set main files untouched or we can add package versions here
        cfg.output.chunkFilename = cfg.output.chunkFilename.replace("_[contenthash]", "");
        cfg.output.filename = cfg.output.filename.replace("_[contenthash]", "");
        console.log(cfg.output.chunkFilename, cfg.output.filename);
        const legacyExternals = new hackedExternals.LegacyExternals({
            gulpTask: build.configureWebpack,
            singleLocale: build.configureWebpack.taskConfig.singleLocale,
            configJson: build.configureWebpack.properties.configJson,
            buildFolder: build.configureWebpack.buildConfig.rootPath,
            serveMode: true // This option leave all names untouched
        });

        for (const plugin of cfg.plugins) {
            if (plugin.constructor.name == "ManifestPlugin") {
                // To add versions to external files, internal function must be rewritten
                legacyExternals.updateWebpackConfiguration(cfg);
            }
        }
        return cfg;
    }
});

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

build.initialize(require('gulp'));
