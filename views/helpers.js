module.exports={
    getError(errors,prop){
        //because we dont now if we receive a proop email or password we use try catch block as a workaround
        try{
            return errors.mapped()[prop].msg;
             //errors.mapped()==={email:{msg:'invalid email'}, password:{msg:'Password to short'}, passwordConfirmation{msg:'Pasword must match'}}
        } catch(err){
            return '';
        }

    }
}

/*    const getError=(errors,prop)=>{
        //prop==='email'||'passwor'||'passwordConfirmation'
    
        //because we dont now if we receive a proop email or password we use try catch block as a workaround
        try {
    
            return errors.mapped()[prop].msg
            //errors.mapped()==={email:{msg:'invalid email'}, password:{msg:'Password to short'}, passwordConfirmation{msg:'Pasword must match'}}
        }
        catch (err){
            return'';
        }
    }
    */