//查询语句
module.exports = {
    getAllMovieList: (actorId) =>
        `
        SELECT
        jp_movie.id,
        idnum,
        title,
        jp_movie.editTime,
        jp_movie.updateTime,
        jp_movie.hot,
        jp_movie.watched,
        jp_movie.addTime,
        jp_movie.liked,
        jp_movie.disabled,
        jp_actor.id AS actorId,
        GROUP_CONCAT( jp_actor.NAME SEPARATOR ',' ) actorName,
        GROUP_CONCAT( jp_actor.id SEPARATOR ',' ) actorId 
    FROM
        jp_movie
        LEFT JOIN jp_actor_movie ON jp_movie.id = jp_actor_movie.movieId
        LEFT JOIN jp_actor ON jp_actor.id = jp_actor_movie.actorId 
    WHERE
        jp_movie.id IN ( SELECT movieId FROM jp_actor_movie ${actorId ? 'WHERE jp_actor_movie.actorId = 1' : ''} ) 
    GROUP BY
        jp_movie.id`//多对多查询并将数据合并
    , getMovieDetail: (id) =>
        `
        SELECT
            jp_movie.*,
            GROUP_CONCAT( jp_actor.id SEPARATOR ',' ) actorId 
        FROM
            jp_movie
            LEFT JOIN jp_actor_movie ON jp_actor_movie.movieId = ${id} 
            LEFT JOIN jp_actor ON jp_actor.id = jp_actor_movie.actorId
        WHERE
            jp_movie.id = ${id} 
        GROUP BY
            jp_movie.id`

}