const express = require('express')
const router = express.Router();

const request = require('request')
const d3 = require('d3')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const multiparty = require('connect-multiparty')
const multipartMiddleware = multiparty()

const sql = require('../controller/sql')
const query = require('../static/query')
const uid = require('../controller/uid')

const uploader = multer({
    dest: path.join(path.dirname(__dirname), 'public', 'imgs')
})
const datetime = d3.timeFormat('%Y-%m-%d %H:%M:%S')
const dateFormat = d3.timeFormat('%Y-%m-%d')
const timeFormat = d3.timeFormat('%H:%M:%S')

router.get('/getActorList', (req, res) => {
    sql.custom(query.getActorList() + ' order by disabled asc,liked desc, editTime desc ', (data) => {
        res.send({ code: 200, msg: 'OK', data })
    })
})//获取所有actor信息，根据顺序liked,normal,disabled

router.get('/getActorDetails', (req, res) => {
    const id = req.query.id
    sql.find({ id }, 'jp_actor', (result) => {
        return res.send({ code: 200, msg: 'OK', data: result[0] })
    })
})//获取某位actor详细信息

router.post('/setActorState', (req, res) => {
    let { id, type, state } = req.body
    state = Number(Boolean(state))
    const now = datetime(new Date())
    sql.update(id, { [type]: state, editTime: now }, 'jp_actor', () => {
        res.send({ code: 304, msg: `操作成功` })
    })
})//更新liked和disabled状态

router.delete('/deleteActor', (req, res) => {
    const id = req.body.id
    sql.delete({ id }, 'jp_actor', () => {
        res.send({ code: 304, msg: `删除成功` })
    })
})//删除某actor的信息

router.post('/setActorDetails', uploader.single('headImage'), (req, res) => {
    const id = req.body.id
    new Promise(resolve => {
        const uuid = uid.uid()
        if (req.file || req.files) {
            const file = req.file ? req.file : req.files.headImage
            const filename = req.body.name + '-' + uuid + path.extname(file.originalname)//文件名
            req.body.headImage = '/public/imgs/' + filename
            fs.rename(file.path, path.join(file.destination, filename), (err) => err ? console.log(err) : null)
            resolve()
        } else if (req.body.headUrl) {
            const coverPath = path.resolve(__dirname, `../public/imgs`)
            const filename = req.body.name + '-' + uuid + '.jpg'
            request(req.body.headUrl, (err) => {
                if (res) {
                    req.body.headImage = '/public/imgs/' + filename
                    resolve()
                }
                else res.send({ code: 500, msg: `解析图片地址错误` })
            }).pipe(fs.createWriteStream(`${coverPath}/${filename}`))
        } else { resolve() }
    }).then(() => {
        delete req.body.headUrl
        if (id) {//更新
            req.body.editTime = datetime(new Date())
            sql.update(id, req.body, 'jp_actor', () => {
                res.send({ code: 304, msg: `保存成功` })
            }, (err) => {
                //演员姓名已存在发生冲突
                if (err.errno === 1062) res.send({ code: 500, msg: '演员姓名已存在' })
                else console.log(err)
            })
        } else {//添加
            delete req.body.id
            sql.add(req.body, 'jp_actor', () => {
                res.send({ code: 304, msg: `添加成功` })
            }, (err) => {
                //演员姓名已存在发生冲突
                if (err.errno === 1062) res.send({ code: 500, msg: '演员姓名已存在' })
                else console.log(err)
            })
        }
    })


})//更新||添加actor信息

router.get('/getMovieList', (req, res) => {
    const actorId = req.query.actorId
    sql.custom(query.getAllMovieList(actorId) + ' order by disabled asc,liked desc, editTime desc ', (data) => {
        res.send({ code: 200, msg: 'OK', data })
    })
})//获取所有movie信息，根据顺序liked,normal,disabled

router.post('/setMovieState', (req, res) => {
    let { id, type, state } = req.body
    state = Number(Boolean(state))
    const now = datetime(new Date())
    sql.update(id, { [type]: state, editTime: now }, 'jp_movie', () => {
        res.send({ code: 304, msg: `操作成功` })
    })
})//更新liked和disabled状态
router.get('/getMovieDetails', (req, res) => {
    const id = req.query.id
    sql.custom(query.getMovieDetail(id), (result) => {
        res.send({ code: 200, msg: 'OK', data: result[0] })
    })
})//获取某Movie详细信息

router.post('/setMovieDetails', uploader.single('coverImg'), (req, res) => {
    const id = req.body.id
    const idnum = req.body.idnum
    new Promise(resolve => {
        const uuid = uid.uid() //替换图片后更新地址，浏览器重新请求
        if (req.file || req.files) {
            const file = req.file ? req.file : req.files.coverImg
            const filename = idnum + '-' + uuid + path.extname(file.originalname)//文件名
            req.body.coverImg = `/public/movies/${idnum}/` + filename
            const coverPath = path.resolve(file.path, `../../movies/${idnum}`)
            fs.mkdir(coverPath, { recursive: true }, (err) => {
                if (err) console.log(err);
                resolve()
                fs.rename(file.path, path.join(coverPath, filename), (err) => err ? console.log(err) : null)
            });
        } else if (req.body.coverUrl) {
            const coverPath = path.resolve(__dirname, `../public/movies/${idnum}`)
            fs.mkdir(coverPath, { recursive: true }, (err) => {
                err && console.log(err);
                const filename = idnum + '-' + uuid + '.jpg'
                request(req.body.coverUrl, (err) => {
                    if (res) {
                        req.body.coverImg = `/public/movies/${idnum}/` + filename
                        resolve()
                    }
                    else res.send({ code: 500, msg: `解析图片地址错误` })
                }).pipe(fs.createWriteStream(`${coverPath}/${filename}`))
            })
        } else { resolve() }
    }).then(() => {
        const actorsId = req.body.actorId.split(',').filter(id => id != "") //array
        const actorsName = req.body.actorName.split(';').filter(name => name != "") //array
        const updateTime = datetime(new Date(req.body.updateTime))
        delete req.body.actorId
        delete req.body.actorName
        delete req.body.id
        delete req.body.coverUrl
        if (actorsId.length) {  //添加的actor信息都存在
            const query_or = actorsId.map(actorId => ` id=${actorId} `).join(' or ')
            sql.custom(`update jp_actor set updateTime='${updateTime}' where updateTime<'${updateTime}' and (${query_or})`)
            if (id) {//movieId已存在，更新
                const query_notEqual = actorsId.map(actorId => ` actorId!=${actorId} `).join(' or ')
                const queryValues = actorsId.map(actorId => `('${actorId}','${id}')`).join(',')
                sql.update(id, req.body, 'jp_movie', () => {
                    sql.custom(`delete from jp_actor_movie where movieId = ${id} and (${query_notEqual})`, () => {
                        sql.custom(`INSERT IGNORE INTO jp_actor_movie ( actorId, movieId ) VALUES${queryValues}`, () => res.send({ code: 304, msg: `保存成功` }))
                    })
                }, (err) => {
                    //idnum已存在发生冲突
                    if (err.errno === 1062) res.send({ code: 500, msg: 'idnum已存在' })
                    else console.log(err)
                })
            } else {//movieId不存在，添加
                sql.add(req.body, 'jp_movie', (result) => {
                    const id = result.insertId//获取插入后返回的movieId
                    const queryValues = actorsId.map(actorId => `('${actorId}','${id}')`).join(',')
                    sql.custom(`INSERT IGNORE INTO jp_actor_movie ( actorId, movieId ) VALUES${queryValues}`, () => res.send({ code: 304, msg: `添加成功` }))//无需删除，只需插入
                }, (err) => {
                    //idnum已存在发生冲突
                    if (err.errno === 1062) res.send({ code: 500, msg: 'idnum已存在' })
                    else console.log(err)
                })
            }
        } else if (actorsName.length) {//添加的actor信息不存在，创建actor
            if (id) {//movieId已存在，更新
                sql.update(id, req.body, 'jp_movie', () => {
                    const queryValues = actorsName.map(actorName => `('${actorName}','${updateTime}')`).join(',')
                    sql.custom(`insert into jp_actor(name,updateTime) values${queryValues}`, (results => {
                        const adds = []
                        for (let i = 0; i < results.affectedRows; i++) {
                            adds.push({ actorId: Number(results.insertId) + i, movieId: id })
                        }
                        sql.adds(adds, 'jp_actor_movie', () => res.send({ code: 304, msg: `保存成功，已新增${actorsName.join(',')}信息` }))
                    }), (err) => {
                        //演员姓名已存在发生冲突
                        if (err.errno === 1062) res.send({ code: 500, msg: '演员姓名已存在' })
                        else console.log(err)
                    })
                }, (err) => {
                    //idnum已存在发生冲突
                    if (err.errno === 1062) res.send({ code: 500, msg: 'idnum已存在' })
                    else console.log(err)
                })
            } else {//movieId不存在，添加
                sql.add(req.body, 'jp_movie', (data) => {
                    const movieId = data.insertId
                    const queryValues = actorsName.map(actorName => `('${actorName}','${updateTime}')`).join(',')
                    sql.custom(`insert into jp_actor(name,updateTime) values${queryValues}`, (results => {
                        const adds = []
                        for (let i = 0; i < results.affectedRows; i++) {
                            adds.push({ actorId: Number(results.insertId) + i, movieId: movieId })
                        }
                        sql.adds(adds, 'jp_actor_movie', () => res.send({ code: 304, msg: `添加成功，已新增${actorsName.join(',')}信息` }))
                    }), (err) => {
                        //演员姓名已存在发生冲突
                        if (err.errno === 1062) res.send({ code: 500, msg: '演员姓名已存在' })
                        else console.log(err)
                    })
                }, (err) => {
                    //idnum已存在发生冲突
                    if (err.errno === 1062) res.send({ code: 500, msg: 'idnum已存在' })
                    else console.log(err)
                })
            }
        }
    })


})//更新||添加movie信息
module.exports = router