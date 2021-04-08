const {
    create
} = require('domain');
const fs = require('fs');
const crypto =require('crypto');
const util=require('util');
const Repository=require('./repository');

const scrypt=util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
    async create(attrs) {
        attrs.id=this.randomId();
        const salt=crypto.randomBytes(8).toString('hex');
        const buf=await scrypt(attrs.password,salt,64)


        const records=await this.getAll();
        const record={
            ...attrs,
            password: `${buf.toString('hex')}.${salt}`
        };
        records.push(record);
        await this.writeAll(records);

        return record;
        
    }
    
    async comparePasswords(saved,supplied){
        //Saved -> password saved in our database.'hashed.salt'

        //Supplied -> given by the user trying sign in

/*         const result=saved.split('.');
        const hashed=result[0];
        const salt=reslut[1]; */

        const [hashed,salt]=saved.split('.');

        const hashedSuppliedBuf=await scrypt(supplied,salt,64);

        return hashed===hashedSuppliedBuf.toString('hex');
    }
}
/* const test = async () => {
    const repo = new UsersRepository('users.json');
    repo.create({email:'dte',password:'dfjake'});
    const users = await repo.getAll();
    console.log(users);
}

test(); */

//Export an instance instead of the class
module.exports=new UsersRepository('users.json');

// Dont export the class because if you make a typo you would have a bad time debugging this stuff
//Examples:
//Another file...
/* const UsersRepository=require('./users');
const repo = new UsersRepository('users.json') */
//yet another file (here because of a missspell of users it will create a whole new file)
/* const UsersRepository=require('./users');
const repo = new UsersRepository('user.json') */