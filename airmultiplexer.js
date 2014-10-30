var airtunes = require('airtunes');
myPCMStream.pipe(airtunes);

var device = airtunes.add("akali", {
  port: 5000,
  volume: 100
});
