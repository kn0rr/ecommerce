
const express = require('express');
const usersRepo=require('../../repositories/users');
const signupTemplate= require('../../views/admin/auth/signup');
const signinTemplate= require('../../views/admin/auth/signin');
const {check, validationResult}= require('express-validator');
const {requireEmail,requirePassword,requirePasswordConfirmation,requireEmailExists,requireValidPassword}=require('./validators');
const router=express.Router();

//route handler
router.get('/signup',(req,res)=>{
    res.send(signupTemplate({req}));
});
//middleware: (we will later use an already implemented body parser)
/* const bodyParser=(req,res,next)=>{
    if (req.method==='POST'){


    req.on('data',data=>{
        console.log(data.toString('utf8'));
        const parsed=data.toString('utf8').split('&');
        const formData={};
        for (let pair of parsed){
            // take first part of split and assign it to key
            // take second part of splita and assing it to value
            const [key,value]= pair.split('=');
            //Add it to formData
            formData[key]=value;
        }
        console.log(formData);
        req.body=formData;
        next();
    });
    }
    else {
        next();
    }
}; */

router.post('/signup',[
    requireEmail,
    requirePassword,
    requirePasswordConfirmation
] ,async (req,res)=>{
    // save output of the validationResult, which represents errors during validation 
    const errors=validationResult(req);
    //console.log(errors)

   console.log(req.body);
    //Check if we got any errors while signup, e.g. by requireEmail
   if (!errors.isEmpty()) {
       return res.send(signupTemplate({req,errors}));
   }

   const {email,password,passwordConfirmation}=req.body


   //Create a user in our user repo to represent this person
   const user=await usersRepo.create({email,password});

   //Store the id of  that user inside the users cookie
   req.session.userId = user.id;// Added by cookie session


    res.send('Account created');
});

router.get('/signout', (req,res)=>{
    req.session=null;
    res.send('You are logged out');
});

router.get('/signin',(req,res)=>{
    //we need to give an empty object because we want to destructer later {error} object, if we not give an empty object a call of signinTemplate() will result in an error.
    res.send(signinTemplate({}));
})
/*OLD
router.post('/signin',[
    check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must provide a valid email')
    .custom(async(email)=>{
        const user=await usersRepo.getOneBy({email});
        if (!user){
            throw new Error('Email not found');
        }
    }),
    check('password')
    .trim()
    .custom(async (password, {req})=>{
        const user=await usersRepo.getOneBy({email:req.body.email});
        if (!user){
            throw new Error('Invalid password');
        }
        const validPassword=await usersRepo.comparePasswords(
            user.password,
            password
        )
        if(!validPassword){
            throw new Error('Invalid Password!');
        }
        return true
    })
], async(req,res)=>{
    const errors=validationResult(req);
    console.log(errors);
    const {email}=req.body;

    const user= await usersRepo.getOneBy({email});

    req.session.userId=user.id;
    res.send('You are singend in ');

});
*/
//new
router.post('/signin',[
    requireEmailExists,
    requireValidPassword
], async(req,res)=>{
    const errors=validationResult(req);
   // console.log(errors);
   if(!errors.isEmpty()){
       return res.send(signinTemplate({errors}));
   }
    const {email}=req.body;

    const user= await usersRepo.getOneBy({email});

    req.session.userId=user.id;
    res.send('You are singend in ');

});

module.exports=router;