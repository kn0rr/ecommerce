const express=require('express');
const multer=require('multer');

const{handleErrors,requireAuth}=require('./middlewares');
const productsRepo=require('../../repositories/products');
const productsNewTemplate = require('../../views/admin/products/new');
const {requireTitle,requirePrice}=require('./validators');
const productsIndexTemplate=require('../../views/admin/products/index');
const productsEditTemplate=require('../../views/admin/products/edit');

const router=express.Router();
const upload=multer({})

router.get('/admin/products',requireAuth,async(req,res)=>{

    const products = await productsRepo.getAll();
    res.send(productsIndexTemplate({products}));
});

router.get('/admin/products/new',requireAuth,(req,res)=>{
    res.send(productsNewTemplate({}));
});

router.post('/admin/products/new',requireAuth,upload.single('image'),[requireTitle,requirePrice],handleErrors(productsNewTemplate),async(req,res)=>{

    const image= req.file.buffer.toString('base64');
    const {title,price}=req.body;
    await productsRepo.create({title,price,image});

    //res.send('submitted');
    res.redirect('/admin/products');
});

router.get('/admin/products/:id/edit',requireAuth,async(req,res)=>{
    //console.log(req.params.id);
    const product= await productsRepo.getOne(req.params.id);
    
    if(!product){
        return res.send('Product not found');
    }
    console.log(product);
    res.send(productsEditTemplate({product}));

})

router.post('/admin/products/:id/edit',requireAuth,
upload.single('image'),
[requireTitle,requirePrice],
//addtionally to productsEditTemplate we need to handle errors if there exists some issues while editing
// Therefore we are passing a optional second argument to handleErrors-function which is a function that looks up for the product
handleErrors(productsEditTemplate, async (req) =>{
    const product = await productsRepo.getOne(req.params.id);
    return {product};
}),
async(req,res)=>{
    const changes= req.body;
    if(req.file){
        changes.image=req.file.buffer.toString('base64');
    }
    try{
    await productsRepo.update(req.params.id,changes);
    }catch(err){
        return res.send('Colud not find item');
    }

    res.redirect('/admin/products');
});

router.post('/admin/products/:id/delete',requireAuth, async (req,res)=>{
 const record = await productsRepo.delete(req.params.id);

 res.redirect('/admin/products');
})

module.exports=router;