var commander = require('commander');
var log = require('./../../../lib/logging');
var generator = require('./../../../lib/generator');
var _ = require('lodash');

commander
  .command('make:view [name]')
  .description('scaffold a new view')
  .option('-s, --split', 'create a single file view')
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
      type: 'view',
      templateDirectory: 'view',
      output: {
        directory: 'src/app/views',
      },
      name: name,
      isSingle: options ? options.single : false,
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
    log('    # Scaffold a view', 'muted');
    log('    $ blue make:view home');
    log();
    log('    # Scaffold a single file view in a custom directory', 'muted');
    log('    $ blue make:view home/index -s');
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
