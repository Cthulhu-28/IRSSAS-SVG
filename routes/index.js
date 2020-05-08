var express = require('express');
var multer = require('multer');
var router = express.Router();
const fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index.ejs');
});

router.get('/:file', function (req, res, next) {
  let fileName = req.params.file;
  console.log(fileName);
  res.render('editor.ejs',{"file": fileName});
});

router.get('/data/:svg', function(req, res, next)  {
  var data = db.get('data').find({svg: req.params.svg}).value();
  if(data){
    res.status(200).json(data);
  }else{
    res.status(400).json(data);
  }
});

router.get('/list/svg', function (req, res, next) {
  // db
  // .get('svgs')
  // .value(list => );
  res.render('list.ejs',{"svgs": db.get('svgs').value()});
});


router.get('/svg/:file', function (req, res, next) {
  let fileName = req.params.file;
  var filePath = "/../svgs/"+fileName;

  fs.readFile(__dirname + filePath, function (err, data) {
    res.contentType("image/svg+xml");
    res.send(data);
  });
});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'svgs')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage })
router.post('/upload', upload.single('svg'), function (req, res, next){
      console.log(req.body.name);
      var file = res.req.file.filename;
      if(file){
        db
        .get('svgs')
        .push({ name: req.body.name, svg: file})
        .write()
        .then(()=>{
          db
          .get('data')
          .push({ svg: file, classes:[], ids:[]})
          .write()
          .then(()=>{
            res.redirect(`/${file}`);
          });
        });
        
      }else{
        res.redirect('/');
      }
      // console.log(`File name: ${res.req.file.filename}`);      
});


router.post('/save/:svg', function (req, res, next){
  let fileContent = req.body.file;
  let fileName = req.params.svg;
  let filePath = "/../svgs/"+fileName;
  fs.writeFile(__dirname + filePath, fileContent,'utf-8', function (err, data) {
    if(err){
      res.status(402).json({'fail':true, 'err':err});
    }else{
      if(fileName){
        db
        .get('data')
        .find({svg:fileName})
        .assign({classes: JSON.parse(req.body.classes), ids: JSON.parse(req.body.ids)})
        .write()
        .then(()=>res.status(200).json({'fail':false}));
      }else{
        res.status(402).json({'fail':true, 'err':err});
      }
    }
  });
});


module.exports = router;
