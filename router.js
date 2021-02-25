const express = require('express')
const util = require('util')
const router = express.Router();
const sql = require('./controller/sql')
const stream = require('./controller/stream')
const query = require('./static/query')

router.get('/stream/:id', (req, res) => {
    const id = req.params.id
    sql.custom(query.findVideoPath(id), (data) => {
        if (!data.length) return res.sendStatus(404);
        const { root, filename } = data[0]
        return stream.stream(req, res, root, filename)
    })
})
router.get('/getVideoList', (req, res) => {
    const actorId = req.query.actorId
    sql.find({ actorId }, 'video', (data) => {
        if (!data.length) return res.sendStatus(404);
        res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" })
        return res.end(JSON.stringify(data))
    })
})
router.get('/getVideoList/:id', (req, res) => {
    const id = req.params.id
    sql.find({ id }, 'video', (data) => {
        if (!data.length) return res.sendStatus(404);
        res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" })
        return res.end(JSON.stringify(data))
    })
})

router.get('/', (req, res) => {
    res.send('hello world')
})


module.exports = router;