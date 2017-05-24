var async = require('async');
var exists = require('fs').existsSync;
var path = require('path');
var render = require('consolidate').handlebars.render;
var Metalsmith = require('metalsmith');
var rename = require('metalsmith-rename');
var Handlebars = require('handlebars');
var log = require('./logging');
var blog = require('./blogging');
var helpers = require('./helpers');
var replace = require('replace-in-file');
var findInFiles = require('find-in-files');
var chalk = require('chalk');
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
    var actionName = this.config.force ? 'overwriting' : 'creating';

    var actionName = {
      past: this.config.force ? 'overwritten' : 'created',
      present:  this.config.force ? 'overwriting' : 'creating', 
    }

    blog(actionName.present, this.config.type + ': ' + this.config.name);
    
    // Setup input
    var inputDirectory = __dirname + '/../src/templates/' + this.config.templateDirectory;

    if (this.config.isSplittable) {
      inputDirectory += '/' + (this.config.isSingle ? 'single' : 'split');
    }
    
    if (this.config.isCookable) {
      inputDirectory += '/' + (this.config.recipe !== null ? 'recipes/' + this.config.recipe : 'default');

      if (!exists(path.resolve(inputDirectory))) {
        log('Recipe does not exist', 'error');
        process.exit(1);
      }
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

    if (!this.config.force && this.config.isSplittable) {
      if (!this.config.isSingle && exists(path.resolve(this.output.directory))) {
        blog('error', this.config.type + ': ' + this.config.name, 'already exists. Use -f or --force to overwrite');
        process.exit(1);
      } 
      else if (this.config.isSingle && exists(path.resolve(this.output.directory + '/' + this.output.fileName + '.vue'))) {
        blog('error', this.config.type + ': ' + this.config.name, 'already exists. Use -f or --force to overwrite');
        process.exit(1);        
      }
    }

    this.registerHandlebars();
    this.generateDirectories();
    this.generateFiles();

    blog(actionName.past, this.config.type + ': ' + this.config.name);

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
          log: 'globally'
        },
        options: {}
      }

      var directory = this.output.directory.replace('src/','')+ "/" + this.output.fileName;

      switch (this.config.type) {
        case 'component':
          register.options.files = 'src/app/components/index.js';
          register.options.to = "  Vue.component('vc-" + this.name + "', require('@/" + directory + ".vue'));\n}";
        break;
        case 'layout':
          register.options.files = 'src/app/layouts/index.js';
          register.options.to = "  Vue.component('vl-" + this.name + "', require('@/" + directory + ".vue'));\n}";
        break;
        case 'mixin':
          register.options.files = 'src/app/mixins/index.js';
          register.options.to = "  Vue.mixin(require('@/" + directory + "'));\n}";
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
          register.options.log = 'into "' + this.config.parent + '" service';
        break;
      }

      _.mergeWith(register.config, register.options, function (objValue, srcValue) {
        if (_.isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      });

      blog('registering', this.config.type + ': ' + this.config.name, register.config.log);

      findInFiles.findSync(directory + '.vue', register.options.files.replace('index.js', ''), 'index.js')
        .then(results => {
          if (results[register.options.files]) {
            blog('error', this.config.type + ': ' + this.config.name, 'reference already registered');
            process.exit(1);
          }
        })
        .catch(error => {
          console.log(error);
        });

      replace(register.config)
        .then(changedFiles => {
          blog('registered', this.config.type + ': ' + this.config.name, 'in ' + changedFiles.join(', '));
        })
        .catch(error => {
          blog('error', this.config.type + ': ' + this.config.name, error);
        });
    }
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
