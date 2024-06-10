const path = require('path');

exports. errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500);
    
    // If you are using a static HTML file for error page
    res.render('user/500',{error:err});
    
    // If you are using a template engine (e.g., EJS)
    // res.render('user/error', { error: err });
};

