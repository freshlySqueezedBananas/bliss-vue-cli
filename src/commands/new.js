var commander = require('commander');
var download = require('download-git-repo');
var exists = require('fs').existsSync;
var path = require('path');
var rename = require('metalsmith-rename');
var ora = require('ora');
var log = require('./../../lib/logging');
require('shelljs/global');

commander
  .command('new <name> [includes...]')
  .description('initialize a fresh application')
  .action(function (name) {
    program.action(name);
  })
  .on('--help', function () {
    program.help();
  });

var program = {
  action: function (name) {
    if (!this.isValid(name)) {
      process.exit(1);
    }

    log('Crafting the application', 'info');

    this.name = name;

    var spinner = ora('Downloading Blue boilerplate');
    spinner.start();

    download('freshlySqueezedBananas/bliss-vue-boilerplate', this.name, { clone: false }, function (err) {
      spinner.stop();

      if (err) {
        log('Whoops! Something went wrong!', 'error');
        log(err, 'error');
        process.exit(1);
      }

      log('Application created!', 'success');
      this.complete();
    }.bind(this))
  },
  complete: function () {
    log();
    log('To get started:');
    log();
    log('  $ cd ' + this.name);
    log('  $ npm install');
    log('  $ npm run dev');
  },
  help: function () {
    log('  Examples:');
    log();
    log('    # will initialize a fresh application', 'muted');
    log('    $ blue new awesome-app');
    log();
  },
  isValid: function (name) {
    var isValid = true;

    if (!name) {
      log('No name specified!', 'error');
      isValid = false;
    }

    if (exists(path.resolve(name))) {
      log('Target directory already exists!', 'error');
      isValid = false;
    }

    return isValid;
  },
};
