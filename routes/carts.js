const express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

//POST request handler
//recieve a post request to add an item to a cart
router.post('/cart/products', async (req, res) => {
    //figure out the cart!
    let cart;
    if (!req.session.cartId) {
        //we dont have a cart, we need to create one
        //store the cart ID on req.session.cartId property
        cart = await cartsRepo.create({ items: [] });
        req.session.cartId = cart.id;
    } else {
        //we have a cart! lets get it from the repository
        cart = await cartsRepo.getOne(req.session.cartId);
    }

    const existingItem = cart.items.find(item => item.id === req.body.productId);
    if (existingItem) {
        //increment quantity and save cart
        existingItem.quantity++;
    } else {
        //add new product id to items array
        cart.items.push({ id: req.body.productId, quantity: 1 });
    }
    await cartsRepo.update(cart.id, {
        items: cart.items
    });

    res.redirect('/cart');
});
//recieve a GET request to a show all items in cart
router.get('/cart', async (req, res) => {
    if (!req.session.cartId) {
        return res.redirect('/');
    }

    const cart = await cartsRepo.getOne(req.session.cartId);

    for (let item of cart.items) {
        const product = await productsRepo.getOne(item.id);

        item.product = product;
    }

    res.send(cartShowTemplate({ items: cart.items }));
});

//recieve a post request to delete an item from a cart
router.post('/cart/products/delete', async (req, res) => {
    const { itemId } = req.body;
    //retrieve our cart out of a carts repository
    const cart = await cartsRepo.getOne(req.session.cartId);

    //iterate over the list of items that are inside of this cart
    const items = cart.items.filter(item => item.id !== itemId);

    //update our cart
    await cartsRepo.update(req.session.cartId, { items });

    //redirect the user back to our main listing page
    res.redirect('/cart');
});

module.exports = router;