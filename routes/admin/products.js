//REQUIRE STATEMENTS
//external library
const express = require('express');
const multer = require('multer');

//authered
const { handleErrors, requireAuth } = require('./middlewares');
const productsRepo = require('../../repositories/products');
const productsNewTemplate = require('../../views/admin/products/new');
const productsIndexTemplate = require('../../views/admin/products/index');
const productsEditTemplate = require('../../views/admin/products/edit');
const { requireTitle, requirePrice } = require('./validators');
const products = require('../../repositories/products');
const req = require('express/lib/request');

const router = express.Router();
//upload is middleware func we can make use of inside of our post request handler
const upload = multer({ storage: multer.memoryStorage() });

//list out all the products we have
router.get('/admin/products', requireAuth, async (req, res) => {
    const products = await productsRepo.getAll();
    res.send(productsIndexTemplate({ products }));
});

//show a form to create new products
//(get = retrieve the form)
router.get('/admin/products/new', requireAuth, (req, res) => {
    res.send(productsNewTemplate({}));
});

//deal with actual form submission
//(post = submit the information from the form)
router.post(
    '/admin/products/new',
    //(middlewares operate in a very specific order!)
    //check if the user is signed in
    requireAuth,
    //first get access to our image & req.body, and through that our title & price
    upload.single('image'),
    //go through our validators that now have access to title and price
    [requireTitle, requirePrice],
    //check to see if any errors occured and if did, return early before we hit that route handler
    handleErrors(productsNewTemplate),
    async (req, res) => {
        //take raw image data that is in buffer property and turn into Base64 string
        const image = req.file.buffer.toString('base64');
        //get access to the title and the price
        const { title, price } = req.body;
        //create the product inside of our products repo
        await productsRepo.create({ title, price, image });

        //show user the product listing page after they create a new product
        res.redirect('/admin/products');
    }
);

//capturing the appropriate id
//:id = (any characters that comes) id of the product we want to edit
router.get('/admin/products/:id/edit', requireAuth, async (req, res) => {
    const product = await productsRepo.getOne(req.params.id);

    if (!product) {
        return res.send('Product not found.');
    }

    res.send(productsEditTemplate({ product }));
});

router.post('/admin/products/:id/edit',
    requireAuth,
    //('image') = name property of the file type input, a link from views/admin/products/edit.js at module.exports in content form
    upload.single('image'),
    //validators
    [requireTitle, requirePrice],
    //if something goes wrong with validators, envoke that template and render it, then return to whoever send that request whatever is inside that template
    //only if something went wrong with validation step, use this function as optional second argument in handling errors
    //this function will return an object that has some data that is going to be forvarded automatically onto our template
    handleErrors(productsEditTemplate, async (req) => {
        const product = await productsRepo.getOne(req.params.id); //(req.params.id) get access of an url objects id
        return { product };
    }),
    //take changes and apply into our productsRepo
    async (req, res) => {
        //changes that we are getting from our form
        const changes = req.body;

        //if file was provided
        if (req.file) {
            //changes.image = new image that we want to set into our repository
            //req.file = file that was uploaded
            //.buffer = array with all the raw data
            //.toString('base64') = take all data inside there and code it as a base64 string
            changes.image = req.file.buffer.toString('base64');
        }

        try {
            //apply this update to our products repository
            //(req.params.id) = that is where we get our ID from, out of the URL /:id/
            //changes = second argument is the object with all the changes we want to apply
            await productsRepo.update(req.params.id, changes)
        } catch (err) {
            return res.send('Could not find item.');
        }

        //if everythig goes well for update statement, redirect the user
        res.redirect('/admin/products');
    }
);

//watch for post req
router.post('/admin/products/:id/delete', requireAuth, async (req, res) => {
    await productsRepo.delete(req.params.id);

    res.redirect('/admin/products');
});

module.exports = router;
