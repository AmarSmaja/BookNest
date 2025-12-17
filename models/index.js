const sequelize = require("../config/db");

//lookup tabele
const Genre = require("./lookup/Genre");
const Langauge = require("./lookup/Language");
const City = require("./lookup/City");
const BookCondition = require("./lookup/BookCondition");
const Tag = require("./lookup/Tag");

const User = require("./users/User");
const SellerProfile = require("./users/SellerProfile");

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
    sequelize, Genre, Langauge, City, BookCondition, Tag, User, SellerProfile, Book, BookImage, BookTag, BookPickupCity, Cart, CartItem, Order, OrderItem, 
    ExchangeRequest, ExchangeOfferedBook, ExchangeRequestedBook, BookRating, BookComment, SellerReview, Conversation, ConversationBook, Message, ConversationRead,
    Report, Notification
};

module.exports = db;