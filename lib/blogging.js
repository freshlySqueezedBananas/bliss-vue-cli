var chalk = require('chalk');

// log('Hello World!', 'error');

module.exports = function (action, type, message) {
  if (!action && !type && !name) {
    console.log();
    return;
  }

  function generateSpaces(n) {
    var spaces = '';

    for (i = 0; i < n; i++) {
      spaces += ' ';
    }

    return spaces;
  }

  function alignSpaces(string, finalLength) {
    var length = string.length;
    var append = preppend = (finalLength - length) / 2;
    if ((finalLength - length) % 2) append++;

    return generateSpaces(append) + string + generateSpaces(preppend);
  }

  var response = chalk.white.bgBlue.bold(' blue ');
  var longest = 'overwritting';

  switch (action) {
    case 'creating':
    case 'overwritting':
    case 'registering':
    case 'testing':
      response += chalk.white.bgMagenta.bold(' ' + alignSpaces(action, longest.length) + ' ');
    break;
    case 'created':
    case 'overwritten':
    case 'registered':
    case 'tested':
      response += chalk.white.bgGreen.bold(' ' + alignSpaces(action, longest.length) + ' ');
    break;
    case 'error':
      response += chalk.white.bgRed.bold(' ERROR ');
    break;
  }

  if (type) {
    response += chalk.inverse(' ' + type + ' ');
  }

  if (message) {
    response += ' ' + message;
  }

  console.log(response);
};
