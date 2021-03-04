var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'media'
});
connection.connect();
/**
 * 
 * @param {Object} obj 被查找的key和value构成的对象
 * @param {String} table 表名
 * @param {Function} callback 查询结果回调
 * @param {String} item 查询要素,中间,分隔
 * @param {String} condition 自定义语句,加在末尾
 */
exports.find = (obj, table, callback, items = '*', condition = '') => {
    var sql = `select ${items} from ` + table;
    var query = '';
    var keys = Object.keys(obj);//需要查找的对象
    var values = Object.values(obj);//对应对象的值
    keys.map((key, index) => {
        if (values[index] != undefined) {
            query += `${key}='${values[index]}'`;
            query += keys[index + 1] ? ' AND ' : '';
        }
    })
    sql += query ? ` where ${query} ` : '';//查询语句
    sql += ' ' + condition
    console.log(sql);
    return connection.query(sql, (err, data) => {
        return err ? Promise.reject(err) : callback(data)//[RowDataPacket{}]
    })
}

/**
 * 
 * @param {Object} obj 要添加的key和value值组成的对象
 * @param {String} table 表名
 * @param {Function} callback 结果回调
 */
exports.add = (obj, table, callback) => {
    var values = Object.values(obj).map(v => `'${v}'`).join(',');
    var keys = Object.keys(obj).join(',');
    var sql = `Insert into ${table}(${keys}) values(${values});`
    console.log(sql);
    connection.query(sql, (err, data) => {
        return err ? Promise.reject(err) : callback(data)
    })
}
/**
 * 
 * @param {Object} obj 要删除的key和对应value的值
 * @param {String} table 表名
 * @param {Function} callback 结果回调
 */
exports.delete = (obj, table, callback) => {
    var sql = 'delete from ' + table;
    var query = '';
    var keys = Object.keys(obj);        //需要查找的对象
    var values = Object.values(obj);    //对应对象的值
    keys.map((key, index) => {
        if (values[index] != undefined) {
            query += `${key}='${values[index]}'`;
            query += keys[index + 1] ? ' AND ' : '';
        }
    })
    if (query) {                      //只有当存在删除条件时才进行删除
        sql = `delete from ${table} where ${query}`;  //查询语句
        console.log(sql)
        connection.query(sql, (err, data) => {
            return err ? Promise.reject(err) : callback(data)
        })
    }
}

/**
 * 
 * @param {*} id id
 * @param {*} obj 要更新的key和对应value的值
 * @param {*} table 表名
 * @param {*} callback 结果回调
 */
exports.update = (id, obj, table, callback) => {
    var values = Object.values(obj);
    var keys = Object.keys(obj);
    var query = ``;
    keys.map((key, index) => {
        if (values[index] != undefined) {
            query += `${key}='${values[index]}'`;
            query += keys[index + 1] ? ' , ' : '';
        }
    })
    var sql = `Update ${table} set ${query} where id='${id}';`
    console.log(sql);
    connection.query(sql, (err, data) => {
        return err ? Promise.reject(err) : callback(data)
    })
}
//自定义查询语句
exports.custom = (sql, callback) => {
    console.log(sql)
    connection.query(sql, (err, data) => {
        return err ? Promise.reject(err) : callback(data)
    })
}