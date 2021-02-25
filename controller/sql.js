var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'zjs'
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
        if (values[index]) {
            query += `${key}='${values[index]}'`;
            query += keys[index + 1] ? ' AND ' : '';
        }
    })
    sql += query ? ` where ${query}` : '';//查询语句
    sql += condition
    console.log(sql);
    return connection.query(sql, (err, data) => {
        return err ? Promise.reject(err) : callback(data)//[RowDataPacket{}]
    })
}

exports.add = (obj, table, callback) => {
    var values = Object.values(obj.data).join(',');
    var keys = Object.keys(obj.data).join(',');
    var sql = `Insert into ${table}(${keys}) values(${values});`
    console.log(sql);
    connection.query(sql, (err, data) => {
        return err ? Promise.reject(err) : callback(data)
    })
}
exports.delete = (obj, table, callback) => {
    var sql = 'delete from ' + table;
    var query = '';
    var keys = Object.keys(obj);        //需要查找的对象
    var values = Object.values(obj);    //对应对象的值
    keys.map((key, index) => {
        if (values[index]) {
            query += `${key}='${values[index]}'`;
            query += keys[index + 1] ? ' AND ' : '';
        }
    })
    console.log(sql);
    if (query) {                      //只有当存在删除条件时才进行删除
        sql += `delete from ${table} where ${query}`;  //查询语句
        connection.query(sql, (err, data) => {
            return err ? Promise.reject(err) : callback(data)
        })
    }
}

exports.update = (id, obj, table, callback) => {
    var values = Object.values(obj.data);
    var keys = Object.keys(obj.data);
    var query = ``;
    keys.map((key, index) => {
        if (values[index]) {
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
    connection.query(sql, (err, data) => {
        return err ? Promise.reject(err) : callback(data)
    })
}