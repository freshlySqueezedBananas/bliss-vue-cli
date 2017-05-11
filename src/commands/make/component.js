var commander = require('commander');
var log = require('./../../../lib/logging');
var generator = require('./../../../lib/generator');
var _ = require('lodash');

commander
  .command('make:component [name]')
  .description('scaffold a new component')
  .option('-s, --single', 'create a single file component')
  .option('-u, --unscoped', 'unscope the style tag')
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
      name: name,
      isSingle: options ? options.single : false,
      isScoped: options ? !options.unscoped : false,
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
    log('    # Scaffold a component', 'muted');
    log('    $ blue make:component panel');
    log();
    log('    # Scaffold a component with unscoped style', 'muted');
    log('    $ blue make:component panel -u');
    log();
    log('    # Scaffold a single file component in a custom directory', 'muted');
    log('    $ blue make:component navbar/navbar-top -s');
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
