var winston = require('winston');

module.exports = function(id) {
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
};
