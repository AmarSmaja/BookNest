var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

require("dotenv").config();

const db = require("./models");

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("DB POVEZAN");

    await db.User.sync({ alter: true });
    await db.SellerProfile.sync({ alter: true });

    await db.Book.sync({ alter: true });
    await db.BookImage.sync({ alter: true });
    await db.BookTag.sync({ alter: true });
    await db.BookPickupCity.sync({ alter: true });

    await db.Cart.sync({ alter: true });
    await db.CartItem.sync({ alter: true });
    await db.Order.sync({ alter: true });
    await db.OrderItem.sync({ alter: true });
    await db.ExchangeRequest.sync({ alter: true });
    await db.ExchangeRequestedBook.sync({ alter: true });
    await db.ExchangeOfferedBook.sync({ alter: true });

    await db.BookRating.sync({ alter: true });
    await db.BookComment.sync({ alter: true });
    await db.SellerReview.sync({ alter: true });

    await db.Conversation.sync({ alter: true });
    await db.ConversationBook.sync({ alter: true });
    await db.Message.sync({ alter: true });
    await db.ConversationRead.sync({ alter: true });

    await db.Report.sync({ alter: true });
    await db.Notification.sync({ alter: true });

    
    console.log("DB SYNCED");
  } catch (e) {
    console.error("DB ERROR: ", e);
  }
})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
