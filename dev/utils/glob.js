var path = require('path');
var glob = require('globby');
var fs = require('fs-extra');

module.exports = {

  ignore: function ignore(dir, pattern) {

    return '!' + path.join(dir, pattern);
  }
}
