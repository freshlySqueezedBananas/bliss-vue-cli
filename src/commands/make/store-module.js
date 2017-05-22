var commander = require('commander');
var log = require('./../../../lib/logging');
var generator = require('./../../../lib/generator');
var _ = require('lodash');

commander
  .command('make:store-module [name]')
  .description('scaffold a new store module')
  .option('-r, --recipe <name>', 'recipe name')
  .action(function (name, options) {
    program.action(name, options);
  })
  .on('--help', function () {
    program.help();
  });

var program = {
  action: function (name, options) {

    if (!this.isValid(name)) {
      process.exit(1);
    }

    _.mergeWith(generator.config, {
      type: 'store module',
      templateDirectory: 'store-module',
      newDir: true,
      output: {
        directory: 'src/app/store/modules',
      },
      name: name,
      recipe: options ? options.recipe : null,
      isCookable: true,
      isSplittable: false,
    }, function (objValue, srcValue) {
      if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    });

    generator.run();
  },
  help: function () {
    log('  Examples:');
    log();
    log('    # will scaffold a new store module', 'muted');
    log('    $ vueture make:store-module user');
    log();
    log('    # will scaffold a new store-module in a custom directory', 'muted');
    log('    $ vueture make:store-module user/admin');
    log();
  },
  isValid: function (name) {
    var isValid = true;

    if (!name) {
      log('No name specified!', 'error');
      isValid = false;
    }

    return isValid;
  }
};
