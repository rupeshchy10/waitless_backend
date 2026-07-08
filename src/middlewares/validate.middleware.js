const validate = (validator) => {
    return (req, res, next) => {
        validator(req.body);

        next();
    };
};

export { validate };
