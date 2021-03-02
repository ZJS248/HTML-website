const express = require('express')
const bodyParser = require('body-parser');
// var multer = require('multer');

const viewRouter = require('./routers/viewRouter');
const managerRouter = require('./routers/manageRouter');

const app = express()
const port = 8897

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// app.use(multer({ dest: '/puclic/' }).array('imgs'))
app.use('/public', express.static('public'))
app.use('/view', viewRouter);//展示页面接口
app.use('/manage', managerRouter)//管理系统接口

app.listen(port, () => {
    console.log(`running on port ${port}...`)
})