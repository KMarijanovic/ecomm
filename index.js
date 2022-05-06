//require in express
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth');
const adminProductsRouter = require('./routes/admin/products');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

//create new library called app
//app is an object that describes all that different things our server can do
const app = express();

//middleware
app.use(express.static('public')); //connecting main.css public folder
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    keys: ['abcdefg']
}));
app.use(authRouter); //hooking up router to app object
app.use(productsRouter);
app.use(adminProductsRouter);
app.use(cartsRouter);

//start listening for incoming network reqs on a particular port on our machine
app.listen(3000, () => {
    console.log('Listening');
});

