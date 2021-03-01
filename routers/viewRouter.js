const express = require('express')
const router = express.Router();
const sql = require('../controller/sql')
const stream = require('../controller/stream')
const query = require('../static/query')

router.all('*', (req, res, next) => {
    // res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" })
    next()
})
router.get('/', (_req, res) => {
    res.send('hello world中文')
})

router.get('/stream/:id', (req, res) => {
    const id = req.params.id
    sql.custom(query.findVideoPath(id), (data) => {
        if (!data.length) return res.sendStatus(404);
        const { root, filename } = data[0]
        return stream.stream(req, res, root, filename)
    })
})
router.get('/getActor', (req, res) => {
    sql.find({}, 'actor', (data) => {
        if (!data.length) return res.sendStatus(404);
        return res.send(JSON.stringify(data))
    })
})
router.get('/getActor/:id', (req, res) => {
    const id = req.params.id
    sql.find({ id }, 'actor', (data) => {
        if (!data.length) return res.sendStatus(404);
        return res.send(JSON.stringify(data[0]))
    })
})
router.get('/getVideo', (req, res) => {
    const actorId = req.query.actorId
    sql.find({ actorId }, 'video', (data) => {
        if (!data.length) return res.sendStatus(404);
        return res.send(JSON.stringify(data))
    })
})
router.get('/getVideo/:id', (req, res) => {
    const id = req.params.id
    sql.find({ id }, 'video', (data) => {
        if (!data.length) return res.sendStatus(404);
        return res.send(JSON.stringify(data[0]))
    })
})

module.exports = router;