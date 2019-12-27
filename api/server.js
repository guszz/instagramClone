var express = require('express')
var bodyParser = require('body-parser')
var mongodb = require('mongodb')
var multipart = require('connect-multiparty')
var objectId = require('mongodb').ObjectId
var fs = require('fs')

var app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(multipart())

app.use(function(req, res, next){

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)

  next()
})

var port = 3333

app.listen(port)

var db = new mongodb.Db(
  'instagramClone',
  new mongodb.Server('localhost', 27017,{}),
  {}
)

console.log('Server ready on port 3333')

// configurando rotas para Insomnia

app.get('/', function(req, res){
  var resposta = {msg: 'Olá Mundo!'}
  res.send(resposta)
})

// POST (create)
app.post('/api',function(req, res){

  var date = new Date()
  var time_stamp = date.getTime()

  var url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename

  var originPath = req.files.arquivo.path
  var destiny = './uploads/' + url_imagem

  fs.rename(originPath, destiny, function(err){
    if(err){
      res.status(500).json({erro:err})
      return
    }

    var dados = {
      url_imagem: url_imagem,
      titulo: req.body.titulo
    }
    
    db.open(function(err, mongoClient){
      mongoClient.collection('postagens',function(err, collection){
        collection.insert(dados, function(err, result){
          if(err){
            res.status(500).json(err)
          }else{
            res.json({'status': 'inclusão realizada com sucesso'})
          }
          mongoClient.close()
        })
      })
    })
  })
  
})

//GET (read)
app.get('/api',function(req, res){

  db.open(function(err, mongoClient){
    mongoClient.collection('postagens',function(err, collection){
      collection.find().toArray(function(err, result){
        if(err){
          res.status(500).json(err)
        }else{
          res.status(200).json(result)
        }
        mongoClient.close()
      })
    })
  })
})

//GET by ID (read)
app.get('/api/:id',function(req, res){
  db.open(function(err, mongoClient){
    mongoClient.collection('postagens',function(err, collection){
      collection.find(objectId(req.params.id)).toArray(function(err, result){
        if(err){
          res.status(404).json(err)
        }else{
          res.json(result)
        }
        mongoClient.close()
      })
    })
  })
})

//GET imagem (read)
app.get('/imagens/:imagem', function(req, res){
  var img = req.params.imagem

  fs.readFile('./uploads/'+img, function(err, content){
    if(err){
      res.status(400).json(err)
      return
    }
    res.writeHead(200, {
      'Content-type' : 'image/jpeg',
      'Content-type' : 'image/bmp',
      'Content-type' : 'image/png',
      'Content-type' : 'image/gif'
    })
    res.end(content)
  })
})

//PUT by ID (update)
app.put('/api/:id',function(req, res){

  db.open(function(err, mongoClient){
    mongoClient.collection('postagens',function(err, collection){
      collection.update(
        {_id : objectId(req.params.id)},
        {$push: {
          comentarios: {
            id_comentario: new objectId(),
            comentario: req.body.comentario
          }
        }},
        {},
        function(err, result){
          if(err){
            res.status(304).json(err)
          }else{
            res.status(200).json(result)
          }
          mongoClient.close()
        }
      )
    })
  })

})

//DELETE by ID do comentario (delete)
app.delete('/api/:id',function(req, res){

  db.open(function(err, mongoClient){
    mongoClient.collection('postagens',function(err, collection){
      collection.update(
        {},
        {$pull: {
          comentarios: {
            id_comentario: objectId(req.params.id),
          }
        }},
        {multi: true},
        
        function(err, result){
          if(err){
            res.status(400).json(err)
          }else{
            res.status(200).json(result)
          }
        mongoClient.close()
      })
    })
  })
})