const sequelize = require("../config/db");

//lookup tabele
const Genre = require("./lookup/Genre");
const Language = require("./lookup/Language");
const City = require("./lookup/City");
const BookCondition = require("./lookup/BookCondition");
const Tag = require("./lookup/Tag");

const User = require("./users/User");
const SellerProfile = require("./users/SellerProfile");
const UserGenreInterest = require("./users/UserGenreInterest");
const UserLanguageInterest = require("./users/UserLanguageInterest");

const Book = require("./knjige/Book");
const BookImage = require("./knjige/BookImage");
const BookTag = require("./knjige/BookTag");
const BookPickupCity = require("./knjige/BookPickupCity");

const Cart = require("./shop/Cart");
const CartItem = require("./shop/CartItem");
const Order = require("./shop/Order");
const OrderItem = require("./shop/OrderItem");
const ExchangeRequest = require("./shop/ExchangeRequest");
const ExchangeRequestedBook = require("./shop/ExchangeRequestedBook");
const ExchangeOfferedBook = require("./shop/ExchangeOfferedBook");

const BookRating = require("./ocjene/BookRating");
const BookComment = require("./ocjene/BookComment");
const SellerReview = require("./ocjene/SellerReview");

const Conversation = require("./chat/Conversation");
const ConversationBook = require("./chat/ConversationBook");
const Message = require("./chat/Message");
const ConversationRead = require("./chat/ConversationRead");

const Report = require("./moderacija/Report");
const Notification = require("./moderacija/Notification");

const db = {
    sequelize, Genre, Language, City, BookCondition, Tag, User, SellerProfile, Book, BookImage, BookTag, BookPickupCity, Cart, CartItem, Order, OrderItem, 
    ExchangeRequest, ExchangeOfferedBook, ExchangeRequestedBook, BookRating, BookComment, SellerReview, Conversation, ConversationBook, Message, ConversationRead,
    Report, Notification, UserGenreInterest, UserLanguageInterest
};

db.Cart.hasMany(db.CartItem, {
    foreignKey: "cartId",
    as: "items"
});

db.CartItem.belongsTo(db.Cart, {
    foreignKey: "cartId"
});

db.CartItem.belongsTo(db.Book, {
    foreignKey: "bookId",
    as: "book"
});

db.Book.hasMany(db.CartItem, {
    foreignKey: "bookId"
});

db.Order.hasMany(db.OrderItem, {
    foreignKey: "orderId",
    as: "items"
});

db.OrderItem.belongsTo(db.Order, {
    foreignKey: "orderId"
});

db.Order.belongsTo(db.User, {
    foreignKey: "kupacId",
    as: "kupac"
});

db.Order.belongsTo(db.User, {
    foreignKey: "prodavacId",
    as: "prodavac"
});

db.OrderItem.belongsTo(db.Book, {
    foreignKey: "bookId",
    as: "knjiga"
});

db.Book.hasMany(db.OrderItem, {
    foreignKey: "bookId"
});

db.Book.belongsTo(db.User, {
    foreignKey: "prodavacId",
    as: "prodavac"
});

db.User.hasMany(db.Book, {
    foreignKey: "prodavacId",
    as: "mojeKnjige"
});

db.Book.belongsTo(db.Genre, { 
    foreignKey: "genreId" 
});

db.Genre.hasMany(db.Book, { 
    foreignKey: "genreId" 
});

db.ExchangeRequest.hasMany(db.ExchangeOfferedBook, {
    foreignKey: "exchangeId",
    as: "offered"
});

db.ExchangeOfferedBook.belongsTo(db.ExchangeRequest, {
    foreignKey: "exchangeId"
});

db.ExchangeRequest.hasMany(db.ExchangeRequestedBook, {
    foreignKey: "exchangeId",
    as: "requested"
});

db.ExchangeRequestedBook.belongsTo(db.ExchangeRequest, {
    foreignKey: "exchangeId"
});

db.ExchangeOfferedBook.belongsTo(db.Book, {
    foreignKey: "bookId",
    as: "book"
});

db.ExchangeRequestedBook.belongsTo(db.Book, {
    foreignKey: "bookId",
    as: "book"
});

db.Book.hasMany(db.ExchangeRequestedBook, {
    foreignKey: "bookId"
});

db.Book.hasMany(db.ExchangeOfferedBook, {
    foreignKey: "bookId"
});

db.BookComment.belongsTo(db.User, {
    foreignKey: "kupacId",
    as: "kupac",
});

db.BookComment.belongsTo(db.Book, {
    foreignKey: "bookId",
    as: "knjiga",
});

db.BookComment.belongsTo(db.Order, {
    foreignKey: "orderId",
    as: "narudzba",
});

db.Book.hasMany(db.BookComment, {
    foreignKey: "bookId",
    as: "komentari",
});

db.User.hasMany(db.BookComment, {
    foreignKey: "kupacId",
    as: "mojiKomentari",
});

db.User.hasMany(db.UserGenreInterest, { 
    foreignKey: "userId" 
});

db.Genre.hasMany(db.UserGenreInterest, { 
    foreignKey: "genreId" 
});

db.UserGenreInterest.belongsTo(db.User, { 
    foreignKey: "userId" 
});

db.UserGenreInterest.belongsTo(db.Genre, { 
    foreignKey: "genreId" 
});

db.User.hasMany(db.UserLanguageInterest, { 
    foreignKey: "userId" 
});

db.Language.hasMany(db.UserLanguageInterest, { 
    foreignKey: "languageId" 
});

db.UserLanguageInterest.belongsTo(db.User, { 
    foreignKey: "userId" 
});

db.UserLanguageInterest.belongsTo(db.Language, { 
    foreignKey: "languageId" 
});

module.exports = db;