const express = require('express');
const cartShowTemplate=require('../views/carts/show');
const cartsRepo= require('../repositories/carts');
const productsRepo=require('../repositories/products');


const router = express.Router();

// Receive a post request to add an item to a cart
router.post('/cart/products', async (req,res)=>{
    //console.log(req.body.productId);
    let cart;
    //Figure out the cart!
    if (!req.session.cartId){
        //We need to create one,because we don't already have one
        //Store the cart id on the req.session.cartId property
        cart=await cartsRepo.create({items:[]});
        req.session.cartId=cart.id;
    }
    else{
        cart= await cartsRepo.getOne(req.session.cartId);
        //We have acart and lets get it from the repository
    }
    const existingItem=cart.items.find(item=>item.id===req.body.productId);
    if(existingItem){
        //increment quantity and save cart
        existingItem.quantity++;
    }
    else {
        //add new product id to items array
        cart.items.push({id:req.body.productId,quantity:1});
    }
    await cartsRepo.update(cart.id,{
        items:cart.items
    });
    res.redirect('/cart');
});

//Receive a GET request to show all items in cart
router.get('/cart',async(req,res)=>{
    if(!req.session.cartId){
        res.redirect('/');
    }
    const cart= await cartsRepo.getOne(req.session.cartId);

    for (let item of cart.items){
        const product= await productsRepo.getOne(item.id);
        item.product=product;
    }
    res.send(cartShowTemplate({items:cart.items}));
});





// Receive a post request to delete an item from a cart
router.post('/cart/products/delete',async(req,res)=>{
    //console.log(req.body.itemId);
    const {itemId}=req.body;
    const cart = await cartsRepo.getOne(req.session.cartId);

    const items=cart.items.filter(item=>item.id!==itemId);

    await cartsRepo.update(req.session.cartId,{items});

    res.redirect('/cart');
})


module.exports=router;