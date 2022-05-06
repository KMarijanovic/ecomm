//require statement
const express = require('express');

const { handleErrors } = require('./middlewares');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const {
    requireEmail,
    requirePassword,
    requirePasswordConfirmation,
    requireEmailExist,
    requireValidPasswordForUser
} = require('./validators');

//an object that will keep a track of all different route handlers
//we can link it back into our index.js file
const router = express.Router();

//route handlers
router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
});

router.post(
    '/signup',
    [requireEmail, requirePassword, requirePasswordConfirmation],
    handleErrors(signupTemplate),
    async (req, res) => {
        const { email, password } = req.body;
        //create a user in our user repo to represent this person
        const user = await usersRepo.create({ email, password });

        //store the ID of that user inside the users cookie
        req.session.userId = user.id;

        res.redirect('/admin/products');
    });

router.get('/signout', (req, res) => {
    req.session = null; //clear out any cookie data you curently have
    res.send('You are logged out.');
})

router.get('/signin', (req, res) => {
    res.send(signinTemplate({})); //pass an empty object
});

router.post(
    '/signin',
    [requireEmailExist, requireValidPasswordForUser],
    handleErrors(signinTemplate),
    async (req, res) => {
        const { email } = req.body; //req.body is all the info we entered in the form

        const user = await usersRepo.getOneBy({ email });

        req.session.userId = user.id;

        res.redirect('/admin/products');
    });

//to make all this different route handlers available to other files inside of our project
module.exports = router;