var express = require('express')
var router = express.Router()

router.post('/search-tasks',function(req,res){
    console.log(req.body)
    res.sendStatus(200)
    res.redirect('/')
})

module.exports = router