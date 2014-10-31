Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
         if(u.hasOwnProperty(this[i])) {
                  continue;
               }
         a.push(this[i]);
         u[this[i]] = 1;
      }
   return a;
}

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var sys = require('sys');
var exec = require('child_process').exec;


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.get('/airplay_devices', getAirplayDevices);

function getAirplayDevices(req, res) {
  var avahi_browse = exec("avahi-browse -apt | grep 'AirTunes Remote Audio'",
    function (error, stdout, stderr) {
      var airplay_devices = stdout.split('+');

      airplay_devices = airplay_devices.filter(function(dev, index) {
         if (typeof dev ==='string') {
           return dev
         }
      }).map(function(dev) {
        return dev.split(';')[3].split('\\064')[1]
      }).getUnique();
      res.send(airplay_devices);
  })
}

app.get('/add_node', addNode);

var shairport;
function addNode(req, res) {
  var node_name = 'airmultiplex1';
  shairport =
    exec('/home/mafi/shairport/shairport -a airmultiplex -o pipe ' +
      '/home/mafi/airmulitplexer/rawpcm.pcm');

 // shairport.on('exit', function (code) {
 //   console.log('Child process exited with exit code '+code);
 // });

  res.send(node_name);
}

var receivers = [];

var start_node;
app.get('/stream', streamNow);
function streamNow(req, res) {
  var playing = req.query;

  receivers = [];

  Object.keys(playing).forEach(function(key) {
    console.log(typeof playing[key].multiplexer);
    if(playing[key].multiplexer === 'false')
      receivers.push(playing[key].name);
  });

  start_node = exec(
    "node node_airtunes/examples/play_stdin.js" +
    " --host " + "'" + receivers.join(' ') + "' < rawpcm.pcm")
  res.send('streaming to: ' + receivers);
}

app.get('/stop_stream', stopStream);
function stopStream(req, res) {
  console.log(start_node.pid)
  kill_node = exec('pkill -P ' + start_node.pid);
  kill_node = exec('kill -9 ' + start_node.pid);
  kill_shairpot = exec('pkill -P ' + shairport.pid);

  res.send('stream has been stopped');
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


process.on('exit', function(code) {
  //shairport.kill('SIGINT');
})

module.exports = app;
