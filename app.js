const express = require('express')
const bodyParser = require('body-parser');

const router = require('./router');

const app = express()
const port = 8897

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use('/', router);

app.listen(port, () => {
    console.log(`running on port 8897...`)
})