//查询语句
module.exports = {
    findVideoPath: (id) => `
        SELECT video.id, actor.root,video.filename FROM video LEFT JOIN actor on actor.id = video.actorid WHERE actor.id = ${id}
    `//根据id查询文件路径
}