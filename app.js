var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

app.use(express.urlencoded({ extended: false }));
require("dotenv").config();

const { attachUser } = require("./middlewares/auth");
const { banGuard } = require("./middlewares/banGuard");

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const session = require("express-session");
app.use(session({
  secret: process.env.SESSION_SECRET || "promijeni",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
}))

app.use(attachUser);
app.use(banGuard);

app.use('/', require("./routes/index"));
app.use("/books", require("./routes/books"));
app.use('/users', require("./routes/users"));

app.use("/auth", require("./routes/auth"));

app.use("/cart", require("./routes/cart"));
app.use("/orders", require("./routes/orders"));
app.use("/notifications", require("./routes/notifications"));
app.use("/exchanges", require("./routes/exchanges"));
app.use("/reports", require("./routes/userReports"));
app.use("/ratings", require("./routes/bookRatings"));
app.use("/comments", require("./routes/comments"));

app.use("/seller", require("./routes/sellerExchanges"));
app.use("/seller", require("./routes/sellerBooks"));
app.use("/seller", require("./routes/sellerApproving"));

app.use("/admin", require("./routes/adminDashboard"));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;