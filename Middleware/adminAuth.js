exports.adminAuth = (req,res,next) =>{
    try {
        if(req.session.admin){
            next();
        }else{
            return res.redirect('/admin/adminLogin');
        }
    } catch (error) {
        console.log(error);
     }
   
}