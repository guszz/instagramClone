var express = require('express')
var bodyParser = require('body-parser')
var mongodb = require('mongodb')
var objectId = require('mongodb').ObjectId

var app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

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
  var dados = req.body

  db.open(function(err, mongoClient){
    mongoClient.collection('postagens',function(err, collection){
      collection.insert(dados, function(err, result){
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

//PUT by ID (read)
app.put('/api/:id',function(req, res){
  db.open(function(err, mongoClient){
    mongoClient.collection('postagens',function(err, collection){
      collection.update(
        {_id : objectId(req.params.id)},
        {$set: {
          titulo: req.body.titulo,
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

//DELETE by ID (delete)
app.delete('/api/:id',function(req, res){
  db.open(function(err, mongoClient){
    mongoClient.collection('postagens',function(err, collection){
      collection.remove({_id : objectId(req.params.id)}, function(err, result){
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