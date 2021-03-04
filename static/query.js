//查询语句
module.exports = {
    findVideoPath: (id) => `
        SELECT video.id, actor.root,video.filename FROM video LEFT JOIN actor on actor.id = video.actorid WHERE actor.id = ${id}
    `//根据id查询文件路径
    , getAllMovieList: (actorId) =>
        `SELECT video.id,idnum,actorId,title,video.editTime, video.updateTime,video.hot,video.watched,video.addTime,video.liked,video.disabled,tags,actor.NAME AS actorName 
        FROM  video LEFT JOIN actor ON actor.id = actorId ${actorId ? `WHERE actor.id = ${actorId} ` : ''}
        ORDER BY video.disabled ASC, video.liked DESC, video.editTime DESC`

}