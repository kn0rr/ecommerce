const express = require('express');
const authRouter=require('./routes/admin/auth');
const adminProductsRouter=require('./routes/admin/products')
const productsRouter=require('./routes/products')
const cartsRouter=require('./routes/carts')

const cookieSession=require('cookie-session');
const users = require('./repositories/users');

// app describes all the things that our webserver can do
const app = express();
//Make everything in public folder accessible to the outside world
app.use(express.static('public'));

app.use(express.urlencoded({extended:true}));
app.use(cookieSession({
    //encryption key to encrypt the cookie data
    keys:['kj4356nl75nd2fjksdafefdce9203dfa21afe']
}));
app.use(authRouter);
app.use(adminProductsRouter);
app.use(productsRouter);
app.use(cartsRouter);

app.listen(3000,()=>{
    console.log('Listening');
});