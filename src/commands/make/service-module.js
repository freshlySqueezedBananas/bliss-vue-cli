var commander = require('commander');
var log = require('./../../../lib/logging');
var generator = require('./../../../lib/generator');
var _ = require('lodash');

commander
  .command('make:service-module [service-name] [name]')
  .description('scaffold a new service')
  .action(function (serviceName, name, options) {
    program.action(serviceName, name, options);
  })
  .on('--help', function () {
    program.help();
  });

var program = {
  action: function (serviceName, name, options) {
    if (!this.isValid(name)) {
      process.exit(1);
    }

    _.mergeWith(generator.config, {
      type: 'service-module',
      templateDirectory: 'service-module',
      output: {
        directory: 'src/app/services/'+serviceName+'/modules',
      },
      name: name,
      parent: serviceName,
      isSplittable: false,
      isSingle: true,
      register: true,
    }, function (objValue, srcValue) {
      if (_.isArray(objValue)) {ß
        return objValue.concat(srcValue);
      }
    });

    generator.run();
  },
  help: function () {
    log('  Examples:');
    log();
    log('    # Scaffold a service', 'muted');
    log('    $ blue make:service auth');
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
