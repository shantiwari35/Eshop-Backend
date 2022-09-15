function errorHandler(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        //unauth error
        return res.status(401).json({ message: 'The user in not authorized' });
    }
    if (err.name === 'validationError') {
        //validation error
        return res.status(401).json({ message: err });
    }
    return res.status(500).json(err);
}
module.exports = errorHandler