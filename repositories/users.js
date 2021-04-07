const {
    create
} = require('domain');
const fs = require('fs');
const crypto =require('crypto');
const util=require('util');

const scrypt=util.promisify(crypto.scrypt);

class UsersRepository {
    constructor(filename) {
        if (!filename) {
            throw new Error('Creating a repository requires a filename');
        }

        this.filename = filename;
        try {
            fs.accessSync(this.filename);
        } catch (err) {
            fs.writeFileSync(this.filename, '[]');
        }
    }
    async getAll() {
        //Open the file called this.filename
        return JSON.parse(await fs.promises.readFile(this.filename, {
            encoding: 'utf-8'
        }));
        }
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

    async writeAll(records){
        await fs.promises.writeFile(this.filename, JSON.stringify(records,null,2));
    }
    randomId(){
        return crypto.randomBytes(4).toString('hex');
    }

    async getOne(id){
        const records= await this.getAll();
        return records.find(record=>record.id===id);
    }

    async delete(id){
        const records=await this.getAll();
        const filteredRecords=records.filter(record=>record.id!==id);
        await this.writeAll(filteredRecords);
    }

    async update(id,attrs){
        const records=await this.getAll();
        const record= records.find(record=>record.id===id);

        if(!record){
            throw new Error(`Record with id ${id} not found`);
        }

        //record==={email:'123@dl.de'}
        //password==={password:'mypassword'}
        //copy everything from second argument and put it into first argument
        Object.assign(record,attrs);
        //record===={{email:'123@dl.de', password:'mypassword'}

        await this.writeAll(record);
    }

    async getOneBy(filters){
        const records = await this.getAll();

        for (let record of records){
            let found=true;

            for (let key in filters){
                if (record[key]!== filters[key]) {
                    found=false;
                }
                if (found){
                    return record;
                }
            }
        }
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