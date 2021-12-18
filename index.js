const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const linkMap = {
    '1': "/redirect-1",
    '2': "/redirect-2",
    '3': "/redirect-3",
}

const linkStats = []

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

createLink = (path, redirectUrl) => ({
    path,
    url: `http://localhost:${PORT}/x/${path}`,
    redirectUrl,
});

app.get('/x/:path', function(req, res){
    const path = req.params.path;
    const redirectUrl = linkMap[path];
    if (redirectUrl) {
        const event = {
            date: new Date().getTime(),
            key: path,
            value: redirectUrl,
            agent: req.header('user-agent'),
            referrer: req.header('referrer') || null,
            ip: req.header('x-forwarded-for') || req.socket.remoteAddress,
        }
        linkStats.push(event);
        res.redirect(redirectUrl);
        return;
    }
    res.status(404);
    res.send('Not found');
});

app.post('/links', function(req, res){
    const params = req.body;
    if (!params || !params.path || !params.redirectUrl){
        res.status(400);
        res.send('path and redirectUrl args required in body in json format');
        return;
    }
    if (linkMap[params.path]){
        res.status(409);
        res.send('Link already exists');
        return;
    }
    // todo clear leading '/' from path and other validation and sanitization
    linkMap[params.path] = params.redirectUrl;
    res.send(createLink(params.path, params.redirectUrl));
})

app.put('/links', function(req, res){
    const params = req.body;
    if (!params || !params.path || !params.redirectUrl){
        res.status(400);
        res.send('path and redirectUrl args required in body in json format');
        return;
    }
    if (!linkMap[params.path]){
        res.status(404);
        res.send('Link not found');
        return;
    }
    // todo clear leading '/' from path and other validation and sanitization
    linkMap[params.path] = params.redirectUrl;
    res.send(createLink(params.path, params.redirectUrl));
})

app.get('/links', function(req, res){
    const allLinks = Object.keys(linkMap).map(path => createLink(path, linkMap[path]));
    res.json(allLinks);
});

app.get('/links/:path', function(req, res){
    const path = req.params.path;
    const redirectUrl = linkMap[path];
    if (redirectUrl) {
        const link = createLink(path, redirectUrl);
        res.json(link);
        return;
    }
    res.status(404);
    res.send('Link not found');
});

app.delete('/links/:path', function(req, res){
    const path = req.params.path;
    const redirectUrl = linkMap[path];
    if (!redirectUrl) {
        res.status(404);
        res.send('Link not found');
        return;
    }
    delete linkMap[path];
    res.status(200)
    res.send();
});

app.get('/stats', function(req, res){
    res.json(linkStats);
});

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
    console.log("Api docs", `http://localhost:${PORT}/api-docs`);
});

