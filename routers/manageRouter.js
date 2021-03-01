const express = require('express')
const router = express.Router();
const sql = require('../controller/sql')
const d3 = require('d3')
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
    const now = d3.timeFormat('%Y-%m-%d %H:%M:%S')(new Date())
    sql.update(id, { [type]: state, editTime: now }, 'actor', () => {
        res.send({ code: 200, msg: 'OK' })
    })
})//更新update和disabled状态
router.delete('/deleteActor', (req, res) => {
    const id = req.body.id
    sql.delete({ id }, 'actor', () => {
        res.send({ code: 200, msg: 'OK' })
    })
})//删除某actor的信息
router.post('/setActorDetails', (req, res) => {
    const id = req.body.id
    if (id) {
        sql.update(id, req.body, 'actor', (result) => {
            res.send({ code: 200, msg: 'OK' })
        })
    } else {
        delete req.body.id
        sql.add(req.body, 'actor', (result) => {
            res.send({ code: 200, msg: 'OK' })
        })
    }
})

module.exports = router