var async = require('async');
var exists = require('fs').existsSync;
var path = require('path');
var render = require('consolidate').handlebars.render;
var Metalsmith = require('metalsmith');
var rename = require('metalsmith-rename');
var Handlebars = require('handlebars');
var log = require('./logging');
var helpers = require('./helpers');
var replace = require('replace-in-file');
var _ = require('lodash');
require('shelljs/global');

module.exports = {
  config: {
    type: 'component',
    templateDirectory: 'component',
    name: 'component',
    parent: '',
    force: false,
    global: false,
    isCookable: false,
    isSplittable: false,
    isScoped: false,
    isSingle: false,
    newDir: false,
    recipe: null,
    output: {
      directory: 'src/app/components',
    },
    handlebars: [],
  },

  run: function () {
    log();
    var actionName = this.config.force ? 'Overwriting' : 'Creating';

    log(actionName + ' ' + this.config.type + ' "' + this.config.name + '"', 'normal');

    // Setup input
    var inputDirectory = __dirname + '/../src/templates/' + this.config.templateDirectory;

    if (this.config.isSplittable) {
      inputDirectory += '/' + (this.config.isSingle ? 'single' : 'split');
    }
    
    if (this.config.isCookable) {
      inputDirectory += '/' + (this.config.recipe ? 'recipes/' + this.config.recipe : 'default');
    }

    this.input = {
      directory: inputDirectory,
      fileName: 'template',
    };

    // Setup output
    var pathSegments = this.config.name.split('/');
    var outputDirectory = this.config.output.directory;
    var outputFilename = '';

    if (pathSegments.length > 1) {
      if (!this.config.isSingle || this.config.newDir) {
        outputDirectory += '/' + this.config.name;
      } 
      else {
        pathSegments.forEach(function (segment, index) {
          if (index !== pathSegments.length - 1) {
            outputDirectory += '/' + segment;
          }
        });
      }

      this.name = pathSegments[pathSegments.length - 1];
      this.isScoped = this.config.isScoped;
      outputFilename = pathSegments[pathSegments.length - 1];
    } 
    else {
      if (!this.config.isSingle || this.config.newDir) {
        outputDirectory += '/' + this.config.name;
      }

      this.name = this.config.name;
      this.isScoped = this.config.isScoped;
      outputFilename = this.config.name;
    }

    this.output = {
      directory: outputDirectory,
      fileName: outputFilename,
    };

    if (!this.config.force && exists(path.resolve(this.output.directory))) {
      log('Target directory already exists! Use -f or --force to overwrite', 'error');
      process.exit(1);
    }


    this.registerHandlebars();
    this.generateDirectories();
    this.generateFiles();

    log(helpers.capitalizeFirstLetter(this.config.type) + ' has been created!', 'success');

    // Register modules
    if (this.config.global) {
      var register = {
        files: '',
        // looks for last } in file
        from: /\}(?=[^}]*$)/,
        to: ''
      };

      var register = {
        config: {
          files: '',
          from: /\}(?=[^}]*$)/,
          to: '',
          log: 'Registering ' + this.config.type + ' "' + this.config.name + '" globally'
        },
        options: {}
      }

      var directory = this.output.directory.replace('src/','');

      switch (this.config.type) {
        case 'component':
          register.options.files = 'src/app/components/index.js';
          register.options.to = "  Vue.component('vc-" + this.name + "', require('@/" + directory + "/"+this.output.fileName+".vue'));\n}";
        break;
        case 'layout':
          register.options.files = 'src/app/layouts/index.js';
          register.options.to = "  Vue.component('vl-" + this.name + "', require('@/" + directory + "/"+this.output.fileName+".vue'));\n}";
        break;
        case 'mixin':
          register.options.files = 'src/app/mixins/index.js';
          register.options.to = "  Vue.mixin(require('@/" + directory + "/" + this.output.fileName + "'));\n}";
        break;
        case 'service-module':
          register.options.files = 'src/app/services/' + this.config.parent + '/index.js';
          register.options.from = [
            /\};(?=[^};]*$)/, 
            /\nexport/g
          ];
          register.options.to = [
            '  ' + this.output.fileName + ',\n};',
            'import ' + this.output.fileName + ' from \'./modules/' + this.output.fileName + '\';\n\nexport'
          ];
          register.options.log = 'Registering ' + this.config.type + ' "' + this.config.name + '" into "' + this.config.parent + '" service';
        break;
      }

      _.mergeWith(register.config, register.options, function (objValue, srcValue) {
        if (_.isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      });

      log(register.config.log, 'normal');

      replace(register.config)
        .then(changedFiles => {
          log(helpers.capitalizeFirstLetter(this.config.type) + ' has been registered!', 'success');
          console.log('Modified files:', changedFiles.join(', '));
        })
        .catch(error => {
          console.error('Error occurred:', error);
        });
  
    }
    log();
  },
  registerHandlebars: function () {
    this.config.handlebars.push({
      keyword: 'filename',
      replacement: this.output.fileName,
    });

    this.config.handlebars.push({
      keyword: 'name',
      replacement: helpers.capitalizeFirstLetter(this.name),
    });

    this.config.handlebars.push({
      keyword: 'scoped',
      replacement: this.isScoped ? ' scoped':'',
    });

    this.config.handlebars.forEach(function (handlebar) {
      Handlebars.registerHelper(handlebar.keyword, function () {
        return handlebar.replacement;
      });
    });
  },

  generateDirectories: function () {
    mkdir('-p', this.output.directory);

    switch (this.config.type) {
        case 'service':
          mkdir('-p', this.output.directory+'/modules');
        break;
      }
  },

  generateFiles: function () {
    Metalsmith(this.input.directory)
      .use(this.renderTemplateFiles)
      .use(
        rename([
          [new RegExp(this.input.fileName), this.output.fileName]
        ])
      )
      .clean(false)
      .source('.')
      .destination(path.resolve(this.output.directory))
      .build(function (err) {
        if (err) {
          log(err, 'error');
        }
      });
  },

  renderTemplateFiles: function (files, metalsmith, done) {
    var keys = Object.keys(files);
    var metalsmithMetadata = metalsmith.metadata();
    async.each(keys, function (file, next) {
      var str = files[file].contents.toString();
      // do not attempt to render files that do not have mustaches
      if (!/{{([^{}]+)}}/g.test(str)) {
        return next()
      }
      render(str, metalsmithMetadata, function (err, res) {
        if (err) return next(err);
        files[file].contents = new Buffer(res);
        next()
      })
    }, done)
  },
};
