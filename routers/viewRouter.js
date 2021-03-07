const express = require('express')
const router = express.Router();
const sql = require('../controller/sql')
const stream = require('../controller/stream')
const query = require('../static/query')

router.all('*', (req, res, next) => {
    // res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" })
    next()
})
router.get('/mvstream/:id', (req, res) => {
    const id = req.params.id
    sql.find({ id }, 'jp_movie', (data) => {
        const { root, filename } = data[0]
        return stream.stream(req, res, root, filename)
    }, 'id,root,filename')
})
router.get('/getActorList', (req, res) => {
    sql.custom(query.getActorList() + ' order by liked desc, hot desc ', (data) => {
        res.send({ code: 200, msg: 'OK', data })
    })
})
router.get('/getActor/:id', (req, res) => {
    const id = req.params.id
    sql.find({ id }, 'jp_actor', (data) => {
        return res.send({ code: 200, msg: 'OK', data: data[0] })
    })
})
router.get('/getVideo', (req, res) => {
    const actorId = req.query.actorId
    sql.custom(query.getAllMovieList(actorId), (data) => {
        return res.send({ code: 200, msg: 'OK', data })
    })
})
router.get('/getVideo/:id', (req, res) => {
    const id = req.params.id
    sql.find({ id }, 'jp_movie', (data) => {
        return res.send({ code: 200, msg: 'OK', data: data[0] })
    })
})

module.exports = router;