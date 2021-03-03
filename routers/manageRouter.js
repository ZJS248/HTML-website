const express = require('express')
const router = express.Router();

const d3 = require('d3')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const multiparty = require('connect-multiparty')
const multipartMiddleware = multiparty()

const sql = require('../controller/sql')

const uploader = multer({
    dest: path.join(path.dirname(__dirname), 'public', 'imgs')
})
const datetime = d3.timeFormat('%Y-%m-%d %H:%M:%S')

router.get('/getActorList', (req, res) => {
    const items = 'id,name,nickname,editTime,updateTime,hot,visited,addTime,liked,disabled'
    const result = [];
    sql.find({ liked: 1, disabled: 0 }, 'actor', (dataLiked) => {
        sql.find({ liked: 0, disabled: 0 }, 'actor', (dataNormal) => {
            sql.find({ disabled: 1 }, 'actor', (dataDisabled) => {
                res.send(dataLiked.concat(dataNormal).concat(dataDisabled))
            }, items, ' order by editTime desc')
        }, items, ' order by editTime desc')
    }, items, ' order by editTime desc')
})//获取所有actor信息，根据顺序liked,normal,disabled

router.get('/getActorDetails', (req, res) => {
    const id = req.query.id
    sql.find({ id }, 'actor', (result) => {
        return res.send(result[0])
    })
})//获取某位actor详细信息

router.post('/setActorState', (req, res) => {
    let { id, type, state } = req.body
    state = Number(Boolean(state))
    const now = datetime(new Date())
    sql.update(id, { [type]: state, editTime: now }, 'actor', () => {
        res.send({ code: 200, msg: 'OK' })
    })
})//更新liked和disabled状态

router.delete('/deleteActor', (req, res) => {
    const id = req.body.id
    sql.delete({ id }, 'actor', () => {
        res.send({ code: 200, msg: 'OK' })
    })
})//删除某actor的信息

router.post('/setActorDetails', uploader.single('headImage'), (req, res) => {
    const id = req.body.id
    const file = req.file ? req.file : req.files['headImage']
    if (file) {
        const filename = req.body.name + path.extname(file.originalname)//文件名
        req.body.headImage = '/public/imgs/' + filename
        fs.rename(file.path, path.join(file.destination, filename), (err) => console.log(err))
    }
    if (id) {//更新
        req.body.editTime = datetime(new Date())
        sql.update(id, req.body, 'actor', () => {
            res.send({ code: 200, msg: 'OK' })
        })
    } else {//添加
        delete req.body.id
        sql.add(req.body, 'actor', () => {
            res.send({ code: 200, msg: 'OK' })
        })
    }
})//更新||添加actor信息
module.exports = router