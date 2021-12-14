
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = 3000;

const linkMap = {
    '1': "/redirect-1",
    '2': "/redirect-2",
    '3': "/redirect-3",
}

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Without middleware
app.get('/', function(req, res){
    res.redirect('/user');
});

app.get('/user', function(req, res){
    res.send("Redirected to User Page");
});

app.get('/links/:linkId', function(req, res){
    const linkId = req.params.linkId;
    const redirectUrl = linkMap[linkId];
    if (redirectUrl) {
        res.redirect(redirectUrl);
        return;
    }
    res.status(404);
    res.send('Link not found');
});

app.post('/links', function(req, res){
    const params = req.body;
    if (!params || !params.key || !params.value){
        res.status(400);
        res.send('key and value args required in body in json format');
        return;
    }
    linkMap[params.key] = params.value;
    res.send();
})

app.get('/links', function(req, res){
    const result = {}
    Object.keys(linkMap).map(key => {
        result[`localhost:${PORT}/links/${key}`] = linkMap[key]
    })
    res.json(result);
});

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});

