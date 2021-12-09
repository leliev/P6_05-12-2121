const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
/**
 * Security middleware
 * Get the token in authorization section of header
 * Compare req userid with the userid present in token
 * If success use next to pass on to the next route
 */
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TKEY);
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Invalid user ID';
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({ error: error | 'Invalid request'});
    }
};