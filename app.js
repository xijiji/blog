var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var connect = require('connect');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var morgan = require('morgan');
var port = process.env.PORT || 4000;

var fs = require('fs');
var app = express();
var dbUrl = 'mongodb://localhost/blog';


var db = mongoose.connect(dbUrl);
// db.connection.on("error", function(error){
//   console.log("connect database failed???");
// });

// db.connection.on("open", function(){
//   console.log("connect database successed!!");
// })

// models loading
var models_path = __dirname + '/app/models'
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file
      var stat = fs.statSync(newPath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath)
        }
      }
      else if (stat.isDirectory()) {
        walk(newPath)
      }
    })
}
walk(models_path)

app.set('views', './app/views/pages');
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'imooc',
  resave: false,
  saveUninitialized: true,
  store: new mongoStore({
    url:dbUrl,
    connection: 'sessions'
  })
}))

// if('development' === app.get('env')){
//   app.set('showStackError', true);
//   app.use(morgan(':method :url :status'));
//   app.locals.pretty = true;
//   mongoose.set('debug', true);
// }

require('./config/routes')(app);

app.use(express.static(path.join(__dirname, 'public')));
app.locals.moment = require('moment');
app.listen(port);

console.log('listening port '+ port);

