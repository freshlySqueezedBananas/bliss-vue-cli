var chalk = require('chalk');

module.exports = function (action, type, message) {
  if (!action && !type && !name) {
    console.log();
    return;
  }

  function generatePaddding(n) {
    var spaces = '';

    for (i = 0; i < parseInt(n); i++) {
      spaces += ' ';
    }

    return spaces;
  }

  function padString(string, finalLength) {
    var length = string.length;
    var append = preppend = (finalLength - length) / 2;
    if ((finalLength - length) % 2) append++;

    return generatePaddding(preppend) + string + generatePaddding(append);
  }

  var response = chalk.white.bgBlue.bold(' blue ');
  var longest = 'overwritting';

  switch (action) {
    case 'creating':
    case 'testing':
      response += chalk.white.bgMagenta.bold(' ' + padString(action, longest.length) + ' ');
    break;
    case 'overwriting':
    case 'registering':
      response += chalk.black.bgYellow.bold(' ' + padString(action, longest.length) + ' ');
    break;
    case 'created':
    case 'overwritten':
    case 'registered':
    case 'tested':
      response += chalk.white.bgGreen.bold(' ' + padString(action, longest.length) + ' ');
    break;
    case 'error':
      response += chalk.white.bgRed.bold(' ' + padString('ERROR', longest.length) + ' ');
    break;
  }

  if (type) {
    response += chalk.black.bgWhite(' ' + type + ' ');
  }

  if (message) {
    response += ' ' + message;
  }

  console.log(response);
};
