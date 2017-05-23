var commander = require('commander');
var download = require('download-git-repo');
var exists = require('fs').existsSync;
var path = require('path');
var rename = require('metalsmith-rename');
var ora = require('ora');
var log = require('./../../lib/logging');
var chalk = require('chalk');

var blog = require('./../../lib/blogging');
require('shelljs/global');

commander
  .command('new <type> <name> [includes...]')
  .description('initialize a fresh application')
  .action(function (type, name, includes) {
    program.action(type, name, includes);
  })
  .on('--help', function () {
    program.help();
  });

var types = {
  spa: {
    repo: 'freshlySqueezedBananas/bliss-vue-boilerplate'
  }
}

var program = {
  action: function (type, name, includes) {0

    if (!types[type]) {
      log(chalk.white.bgBlue.bold(' blue ') + chalk.white.bgRed.bold(' ERROR ') + ' Chosen type "' + type + '" does not exist');
      process.exit(1);
    }

    if (!this.isValid(name)) {
      process.exit(1);
    }
 
    blog('creating', type, name);

    this.name = name;

    var spinner = ora(chalk.white.bgBlue.bold(' blue ') + ' Downloading ' + type + ' boilerplate');
    spinner.start();

    download(types[type].repo, this.name, { clone: false }, function (err) {
      spinner.stop();

      if (err) {
        log('Whoops! Something went wrong!', 'error');
        log(err, 'error');
        process.exit(1);
      }

      blog('created', type, name);
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
    log('  Available types:');
    log();
    log('    ' + chalk.red('pwa') + '         Progressive Web App - ' + chalk.red('TO BE IMPLEMENTED'));
    log('    spa         Single Page Application');
    log('    ' + chalk.red('ssr') + '         Server Side Rendered Application - ' + chalk.red('TO BE IMPLEMENTED'));
    log();
    log('  Examples:');
    log();
    log('    # initialize a fresh SPA application', 'muted');
    log('    $ blue new spa awesome-app');
    log();
  },
  isValid: function (name) {
    var isValid = true;

    if (!name) {
      blog('error', false, 'Invalid name');
      isValid = false;
    }

    if (exists(path.resolve(name))) {
      blog('error', false, 'Target directory ' + chalk.inverse(' ' + name + ' ') + ' already exists');
      isValid = false;
    }

    return isValid;
  },
};
