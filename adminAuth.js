const jwt = require("jsonwebtoken");



module.exports = function(req, res, next) {

  const token = req.cookies.token
  if (!token) return res.status(401).redirect('/');

  try {
    const decoded = jwt.verify(token, process.env.authToken);
    req.user = decoded.user;
    if(decoded.user.role!=="admin"){
    res.status(403).redirect("/dashboard")
    }
    else{
    
    next();
    }
  } catch (e) {
    
   // console.error(e);
    res.cookie('token',"",{
      expires: new Date(Date.now() - 900000)})
    res.status(500).redirect("/");
  }
};