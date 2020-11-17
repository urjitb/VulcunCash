const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {

  const token = req.cookies.token
  if (!token) return res.status(401).redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.authToken);
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error(e);
    res.cookie('token',"",{
      expires: new Date(Date.now() - 900000)})
    res.status(500).redirect("/");
  }
};