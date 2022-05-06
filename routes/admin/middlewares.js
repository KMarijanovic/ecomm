//our custom middleware

//require validation result function from express validator library
const { validationResult } = require('express-validator');

module.exports = {
    handleErrors(templateFunc, dataCb) {
        //return the func that is going to be executed every single time when request comes in
        //(next) is an argument that says "everything went well, you can continue processing request"
        //dataCb is an optional argument
        return async (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                //update the data by let variable so it can be accessed freely outside the if statement
                //default value of data is an empty object
                let data = {};
                //if dataCb exist
                if (dataCb) {
                    // call it and take that value and spread it into the errors object that eventually goes of to our templateFunc
                    data = await dataCb(req);
                }
                //templateFunc will have access to data we care about (product and its details)
                return res.send(templateFunc({ errors, ...data }));
            }

            next();
        };
    },
    requireAuth(req, res, next) {
        //if there is no user ID present
        if (!req.session.userId) {
            return res.redirect('/signin');
        }

        next();
    }
};