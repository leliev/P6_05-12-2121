//Check conformity of user sent data
module.exports = (req, res, next) =>{
    const mailRegEx = /^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/;
    const isValidMail = mailRegEx.test(req.body.email);
    //In order at least one digit, one lower case, one upper case, one special char and no space
    const passwordRegEx = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/;
    const isValidPass = passwordRegEx.test(req.body.password);

    if (!isValidMail) {
        res.status(400).json({ message: 'Must be valid Email exemple@exemple.com' });
    }
    if (!isValidPass) {
        res.status(400).json({ 
            message: 'At least 8 characters: one digit, one lower case, one upper case, one special character, no whitespace '
        });
    }
    else {
        next();
    }
}