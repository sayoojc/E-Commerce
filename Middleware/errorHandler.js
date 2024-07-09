
exports.serverErrorHandler = (err, req, res, next) => {
  console.log('The error handler triggered');
  const statusCode = err.status || 500;
  const reqUrl = req.originalUrl;
  const isApiRequest = req.xhr || req.headers.accept.indexOf('json') > -1;

  if (isApiRequest) {
    console.log('inside the api request block');
    res.status(statusCode).send({ error: 'internal server error' });
  } else {
    const baseUrl = reqUrl.slice(0, 6);
    let action = baseUrl === '/admin' ? '/admin/Dashboard' : '/getHome';

    res.status(statusCode);
    res.render('user/500', { action });
  }
};

   
exports.handlerNotFound = (req,res,error) => {
     try {
          let action;
          let reqUrl = req.originalUrl
          let baseUrl = reqUrl.slice(0,6);
          
          if(baseUrl === '/admin'){
               action = '/admin/Dashboard';
          }else {
               action = '/getHome';
          }
       res.render('user/404',{action});
     } catch (error) {
       error.status = 404;
     next(error); 
     }
    };