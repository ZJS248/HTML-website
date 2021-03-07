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
 * @param {Function} caught 失败错误回调
 */
exports.find = (obj, table, callback = () => null, items = '*', condition = '', caught = (err) => console.log(err)) => {
    if (!items) items = '*'
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
    return connection.query(sql, (err, data) => {
        return err ? caught(err) : callback(data)//[RowDataPacket{}]
    })
}

/**
 * 
 * @param {Object} obj 要添加的key和value值组成的对象
 * @param {String} table 表名
 * @param {Function} callback 结果回调
 * @param {Function} caught 失败错误回调
 */
exports.add = (obj, table, callback = () => null, caught = (err) => console.log(err)) => {
    var values = Object.values(obj).map(v => `'${v}'`).join(',');
    var keys = Object.keys(obj).join(',');
    var sql = `Insert into ${table}(${keys}) values(${values});`
    connection.query(sql, (err, data) => {
        return err ? caught(err) : callback(data)
    })
}
/**
 * 批量多条记录插入
 * @param {Array} arr 要添加的key和value值组成的对象数组
 * @param {String} table 表名
 * @param {Function} callback 结果回调
 * @param {Function} caught 失败错误回调
 */
exports.adds = (arr, table, callback = () => null, caught = (err) => console.log(err)) => {
    let query = [];
    const keys = Object.keys(arr[0]).join(',')
    arr.forEach(obj => {
        query.push(`(${Object.values(obj).map(v => `'${v}'`).join(',')})`)
    })
    var sql = `Insert into ${table}(${keys}) values${query.join(',')};`
    connection.query(sql, (err, data) => {
        return err ? caught(err) : callback(data)
    })
}
/**
 * 
 * @param {Object} obj 要删除的key和对应value的值
 * @param {String} table 表名
 * @param {Function} callback 结果回调
 * @param {Function} caught 失败错误回调
 */
exports.delete = (obj, table, callback = () => null, caught = (err) => console.log(err)) => {
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
        connection.query(sql, (err, data) => {
            return err ? caught(err) : callback(data)
        })
    }
}

/**
 * 
 * @param {*} id id
 * @param {Object} obj 要更新的key和对应value的值
 * @param {String} table 表名
 * @param {Function} callback 结果回调
 * @param {Function} caught 失败错误回调
 */
exports.update = (id, obj, table, callback = () => null, caught = (err) => console.log(err)) => {
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
    connection.query(sql, (err, data) => {
        return err ? caught(err) : callback(data)
    })
}
//自定义查询语句
/**
 * 
 * @param {String} sql 自定义sql语句
 * @param {Function} callback 成功结果回调
 * @param {Function} caught 失败错误回调
 */
exports.custom = (sql, callback = () => null, caught = (err) => console.log(err)) => {
    connection.query(sql, (err, data) => {
        return err ? caught(err) : callback(data)
    })
}