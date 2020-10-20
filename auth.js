const jwt = require("jsonwebtoken");



module.exports = function(req, res, next) {
    console.log("test")
    console.log(req.cookies.token)

  const token = req.cookies.token
  if (!token) return res.status(401).json({ message: "Auth Error" });

  try {
    const decoded = jwt.verify(token, process.env.authToken);
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send("You aren't logged in");
  }
};