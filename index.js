const express = require('express');
const authRouter=require('./routes/admin/auth');


const cookieSession=require('cookie-session');
const users = require('./repositories/users');

// app describes all the things that our webserver can do
const app = express();

app.use(express.urlencoded({extended:true}));
app.use(cookieSession({
    //encryption key to encrypt the cookie data
    keys:['kj4356nl75nd2fjksdafefdce9203dfa21afe']
}));
app.use(authRouter);

app.listen(3000,()=>{
    console.log('Listening');
});