const jwt = require("jsonwebtoken");

const doneAuthenticating = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No Token, Authorization denied" });
  }

  try {
    decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Access Denied !!" });
  }
};


module.exports = {
    doneAuthenticating,
  };