const express = require('express');
const router = express.Router();

router.get('/serverError', (req, res, next) => {
    const error = req.query.message || 'An unexpected error occurred.';
    res.render('user/500', { error });
});

module.exports = router;
