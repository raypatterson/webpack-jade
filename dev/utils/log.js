var logr = require('logr.js');
var winston = require('winston');

module.exports = function(id) {
  if (typeof module === 'object' && module.exports) {
    // More than likely executing in Node.js
    return new winston.Logger({
      transports: [
        new winston.transports.Console({
          label: id,
          level: 'silly',
          colorize: true,
          timestamp: true,
          prettyPrint: true
        })
      ]
    });
  } else if (typeof window !== 'undefined') {
    // More than likely executing in browser
    return logr.get(id);
  } else {
    // No idea, so play it safe
    return console;
  }
};
