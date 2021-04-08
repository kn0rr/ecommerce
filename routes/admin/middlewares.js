const {validationResult}=require('express-validator');

module.exports={
    handleErrors(templateFunc,dataCallback){
        return async (req,res,next) =>{
            const errors= validationResult(req);

            if(!errors.isEmpty()){
                //initialize empty object to prevent undefined
                let data={};
                if(dataCallback){
                    data=await dataCallback(req);
                    
                }
                // if data is present merging existing content of data to errors
                return res.send(templateFunc({errors, ...data}));
            }
            next();
        };
    },
    requireAuth (req,res,next) {
        if (!req.session.userId){
            return res.redirect('/signin');
        }
        next();
    }
}