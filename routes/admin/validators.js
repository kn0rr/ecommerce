const {check} =require('express-validator');
const usersRepo=require('../../repositories/users');


module.exports={
    requireTitle:check('title')
    .trim()
    .isLength({min:3, max:40})
    .withMessage('Must be between 3 and 40 characters'),
    requirePrice:check('price')
    .trim()
    .toFloat()
    .isFloat({min:0})
    .withMessage('Must be a number greater than 0')
    ,
    requireEmail: check('email').trim().normalizeEmail().isEmail().withMessage('Must be a valid email').custom(async(email)=>{
        const existingUser= await usersRepo.getOneBy({email});
        if (existingUser){
            throw new Error('E-mail already in use');
        }
        return true;
    }),
    requirePassword:check('password').trim().isLength({min: 4, max:20}).withMessage('Must be between 4 and 20 characters'),
    requirePasswordConfirmation:check('passwordConfirmation').trim().isLength({min: 4, max:20}).withMessage('Must be between 4 and 20 characters').custom((passwordConfirmation,{req})=>{
        if(req.body.password !== passwordConfirmation){
            throw new Error('Passwords must match');
        }
        return true;
    }),
    requireEmailExists:check('email')
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
    requireValidPassword: check('password')
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

}