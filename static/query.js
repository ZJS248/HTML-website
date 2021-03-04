//查询语句
module.exports = {
    getAllMovieList: (actorId) =>
        `SELECT jp_movie.id,idnum,actorId,title,jp_movie.editTime, jp_movie.updateTime,jp_movie.hot,jp_movie.watched,jp_movie.addTime,jp_movie.liked,jp_movie.disabled,tags,jp_actor.name AS actorName 
        FROM  jp_movie LEFT JOIN jp_actor ON jp_actor.id = actorId ${actorId ? `WHERE jp_actor.id = ${actorId} ` : ''}
        ORDER BY jp_movie.disabled ASC, jp_movie.liked DESC, jp_movie.editTime DESC`

}