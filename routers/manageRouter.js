const express = require('express')
const router = express.Router();

const d3 = require('d3')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const multiparty = require('connect-multiparty')
const multipartMiddleware = multiparty()

const sql = require('../controller/sql')
const query = require('../static/query')

const uploader = multer({
    dest: path.join(path.dirname(__dirname), 'public', 'imgs')
})
const datetime = d3.timeFormat('%Y-%m-%d %H:%M:%S')
const dateFormat = d3.timeFormat('%Y-%m-%d')
const timeFormat = d3.timeFormat('%H:%M:%S')

router.get('/getActorList', (req, res) => {
    const items = 'id,name,nickname,editTime,updateTime,hot,visited,addTime,liked,disabled'
    const result = [];
    sql.find({}, 'jp_actor', (data) => {
        res.send(data)
    }, items, ' order by disabled asc,liked desc, editTime desc ')
})//获取所有actor信息，根据顺序liked,normal,disabled

router.get('/getActorDetails', (req, res) => {
    const id = req.query.id
    sql.find({ id }, 'jp_actor', (result) => {
        return res.send(result[0])
    })
})//获取某位actor详细信息

router.post('/setActorState', (req, res) => {
    let { id, type, state } = req.body
    state = Number(Boolean(state))
    const now = datetime(new Date())
    sql.update(id, { [type]: state, editTime: now }, 'jp_actor', () => {
        res.send({ code: 200, msg: 'OK' })
    })
})//更新liked和disabled状态

router.delete('/deleteActor', (req, res) => {
    const id = req.body.id
    sql.delete({ id }, 'jp_actor', () => {
        res.send({ code: 200, msg: 'OK' })
    })
})//删除某actor的信息

router.post('/setActorDetails', uploader.single('headImage'), (req, res) => {
    const id = req.body.id
    if (req.file || req.files) {
        const file = req.file ? req.file : req.files.headImage
        const filename = req.body.name + path.extname(file.originalname)//文件名
        req.body.headImage = '/public/imgs/' + filename
        fs.rename(file.path, path.join(file.destination, filename), (err) => console.log(err))
    }
    if (id) {//更新
        req.body.editTime = datetime(new Date())
        sql.update(id, req.body, 'jp_actor', () => {
            res.send({ code: 200, msg: 'OK' })
        })
    } else {//添加
        delete req.body.id
        sql.add(req.body, 'jp_actor', () => {
            res.send({ code: 200, msg: 'OK' })
        })
    }
})//更新||添加actor信息

router.get('/getMovieList', (req, res) => {
    const actorId = req.query.actorId
    sql.custom(query.getAllMovieList(actorId), (data) => {
        res.send(data)
    })
})//获取所有movie信息，根据顺序liked,normal,disabled

router.post('/setMovieState', (req, res) => {
    let { id, type, state } = req.body
    state = Number(Boolean(state))
    const now = datetime(new Date())
    sql.update(id, { [type]: state, editTime: now }, 'jp_movie', () => {
        res.send({ code: 200, msg: 'OK' })
    })
})//更新liked和disabled状态
router.get('/getMovieDetails', (req, res) => {
    const id = req.query.id
    sql.find({ id }, 'jp_movie', (result) => {
        return res.send(result[0])
    })
})//获取某Movie详细信息

router.post('/setMovieDetails', uploader.single('coverImg'), (req, res) => {
    const id = req.body.id
    if (req.file || req.files) {
        const file = req.file ? req.file : req.files.coverImg
        const filename = req.body.name + path.extname(file.originalname)//文件名
        req.body.coverImg = '/public/imgs/' + filename
        fs.rename(file.path, path.join(file.destination, filename), (err) => console.log(err))
    }
    if (id) {//更新
        req.body.editTime = datetime(new Date())
        sql.update(id, req.body, 'jp_movie', () => {
            res.send({ code: 200, msg: 'OK' })
        })
    } else {//添加
        delete req.body.id
        sql.add(req.body, 'jp_movie', () => {
            res.send({ code: 200, msg: 'OK' })
        })
    }
})//更新||添加movie信息
module.exports = router