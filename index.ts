import {MockLinkRepository} from "./LinkRepository";
import {MockLinkEventRepository} from "./LinkEventRepository";

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const PORT = 3000;
const URL = `localhost:${PORT}`;
const LINK_URL_PREFIX = `${URL}/x`;

const linkRepo = new MockLinkRepository(LINK_URL_PREFIX);
const eventRepo = new MockLinkEventRepository();

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/x/:path', function(req, res){
    const path = req.params.path;
    const link = linkRepo.findOne(path);
    if (!link){
        res.status(404);
        res.send('Not found');
        return;
    }
    const event = MockLinkEventRepository.fromRequest(req, link);
    eventRepo.save(event);
    res.redirect(link.redirectUrl);
});

app.post('/links', function(req, res){
    const params = req.body;
    if (!params || !params.path || !params.redirectUrl){
        res.status(400);
        res.send('path and redirectUrl args required in body in json format');
        return;
    }
    if (linkRepo.findOne(params.path)){
        res.status(409);
        res.send('Link already exists');
        return;
    }
    // todo clear leading '/' from path and other validation and sanitization
    const link = linkRepo.save({path: params.path, redirectUrl: params.redirectUrl});
    res.send(link);
})

app.put('/links', function(req, res){
    const params = req.body;
    if (!params || !params.path || !params.redirectUrl){
        res.status(400);
        res.send('path and redirectUrl args required in body in json format');
        return;
    }
    if (!linkRepo.findOne(params.path)){
        res.status(404);
        res.send('Link not found');
        return;
    }
    // todo clear leading '/' from path and other validation and sanitization
    const link = linkRepo.save({path: params.path, redirectUrl: params.redirectUrl});
    res.send(link);
})

app.get('/links', function(req, res){
    res.json(linkRepo.findAll());
});

app.get('/links/:path', function(req, res){
    const path = req.params.path;
    const link = linkRepo.findOne(path);
    if (!link) {
        res.status(404);
        res.send('Link not found');
        return;
    }
    res.json(link);
});

app.delete('/links/:path', function(req, res){
    const path = req.params.path;
    const link = linkRepo.findOne(path);
    if (!link) {
        res.status(404);
        res.send('Link not found');
        return;
    }
    if (!linkRepo.removeOne(link.path)){
        res.status(500)
        res.send('Internal server error');
    }
    res.status(200)
    res.send();
});

app.get('/events', function(req, res){
    res.json(eventRepo.findAll());
});

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
    console.log("Api docs", `http://localhost:${PORT}/api-docs`);
});

