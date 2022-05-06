const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt); //func that return promise

class UsersRepository extends Repository {
    async comparePasswords(saved, supplied) {
        const [hashed, salt] = saved.split('.');
        const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

        return hashed === hashedSuppliedBuf.toString('hex');
    }

    async create(attrs) {
        attrs.id = this.randomId();

        const salt = crypto.randomBytes(8).toString('hex'); //got salt
        const buf = await scrypt(attrs.password, salt, 64); //got hashed password

        const records = await this.getAll(); //existing list of users
        const record = {
            ...attrs,
            password: `${buf.toString('hex')}.${salt}`
        };
        //push new user with salted password
        records.push(record);

        await this.writeAll(records);

        return record;
    }

    async comparePasswords(saved, supplied) {
        //saved --> password saved in our database 'hashed.salt'
        //supplied --> password given to us by user trying to sign in
        const [hashed, salt] = saved.split('.');
        const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

        return hashed === hashedSuppliedBuf.toString('hex');
    }
}

module.exports = new UsersRepository('users.json');