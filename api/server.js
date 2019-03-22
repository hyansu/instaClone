var express = require('express');
var bodyparser = require('body-parser');
var mongodb = require('mongodb').MongoClient;
var objectid = require('mongodb').ObjectId;
var multipart = require('connect-multiparty');
var fs = require('fs');
var app = express();

//body-parser

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
app.use(multipart());
app.use(function(request, response, next){

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'content-type');
    response.setHeader('Access-Control-Allow-Credentials', true);
    
    next();
});

var port = 3000;

app.listen(port);

console.log('Servidor escutando na porta '+port);

app.get('/', (request, response) => {
    response.send({msg: 'Olá'});
});

app.post('/api', (request, response) => {

    var date = new Date();
    var timeStamp = date.getTime();
    var imagename = timeStamp + '-' + request.files.arquivo.originalFilename;

    var path_origin = request.files.arquivo.path;
    var path_destiny = './uploads/' + imagename;

    fs.rename(path_origin, path_destiny, function(error){
        if(error){
            response.status(500).json({error: error});
            return;
        }

    var data = {imageUrl: imagename, title: request.body.titulo};
    
    mongodb.connect('mongodb://localhost:27017', function(error, mongoClient){
        var db = mongoClient.db('insta');
        var collection = db.collection('postagens');
        collection.insert(data, function(errors, records){
            if(error){
                response.json({'errors': errors});
            }else{
                response.json({'status': 'inclusão realizada com sucesso' });
            }
            mongoClient.close();
        });        
    });
    

    });


});

app.get('/api', (request, response) => {

    mongodb.connect('mongodb://localhost:27017', function(error, mongoClient){
        var db = mongoClient.db('insta');
        var collection = db.collection('postagens');
        collection.find().toArray(function(error, result){
            if(error){
                response.json(error);
            }else{
                response.json(result);
            }
            mongoClient.close();
        });        
    });
});

app.get('/api/:id', (request, response) => {

    mongodb.connect('mongodb://localhost:27017', function(error, mongoClient){
        var db = mongoClient.db('insta');
        var collection = db.collection('postagens');
        collection.find(objectid(request.params.id)).toArray(function(error, result){
            if(error){
                response.json(error);
            }else{
                response.json(result);
            }
            mongoClient.close();
        });        
    });
});

app.get('/images/:image', (request, response) => {
    var img = request.params.image;
    fs.readFile('./uploads/' + img, function(error, filecontent){
        if(error){
            response.status(400).json(error);
            return;
        }
        response.writeHead(200, {'content-type':'image/jpg'});
        response.end(filecontent);
    });
});

app.put('/api/:id', (request, response) => {       
    
    mongodb.connect('mongodb://localhost:27017', function(error, mongoClient){
        var db = mongoClient.db('insta');
        var collection = db.collection('postagens');
        collection.update({_id: objectid(request.params.id)},{$push:{comentarios:{idcomentario: new objectid(), comentario: request.body.comentario}}}, function(error, records){
            if(error){
                response.json(error);
            }else{
                response.json(records);
            }
            mongoClient.close();
        });        
    });
    
});