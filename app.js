var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const PORT = process.env.PORT || 7000
var app = express();
app.set('port',PORT);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


global.db = undefined;
const adapter = new FileAsync('db.json');
low(adapter)
  .then(db=>{
    global.db = db;
    app.use('/', indexRouter);
    app.use('/users', usersRouter);
    return db.defaults({ svgs: [] }).write()
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  });


