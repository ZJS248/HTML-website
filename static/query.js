//查询语句
module.exports = {
    //`insert into jp_actor_movie (actorId,movieId) select xxx,yyy from dual where not exists (select * from jp_actor_movie where (actorId=xxx and movieId=yyy))` //单条数据不重复则插入
    //INSERT IGNORE INTO jp_actor_movie ( actorId, movieId ) VALUES( '1', '1' ),('12','3') //多个字段批量不重复则插入--前提被插入多个字段字段联合需唯一
    //CREATE UNIQUE INDEX IDIndex ON jp_actor_movie(actorId,movieId); //创建多个插入字段联合唯一

    getAllMovieList: (actorId) =>
        `
        SELECT
        jp_movie.id,
        idnum,
        title,
        coverImg,
        jp_movie.editTime,
        jp_movie.updateTime,
        jp_movie.hot,
        jp_movie.watched,
        jp_movie.addTime,
        jp_movie.tags,
        jp_movie.liked,
        jp_movie.disabled,
        jp_actor.id AS actorId,
        GROUP_CONCAT( jp_actor.NAME SEPARATOR ',' ) actorName,
        GROUP_CONCAT( jp_actor.nickname SEPARATOR ',' ) actorNickName,
        GROUP_CONCAT( jp_actor.id SEPARATOR ',' ) actorId 
    FROM
        jp_movie
        LEFT JOIN jp_actor_movie ON jp_movie.id = jp_actor_movie.movieId
        LEFT JOIN jp_actor ON jp_actor.id = jp_actor_movie.actorId 
    WHERE
        jp_movie.id IN ( SELECT movieId FROM jp_actor_movie ${actorId ? 'WHERE jp_actor_movie.actorId = ' + actorId : ''} ) 
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
    , getActorList: () => `
        SELECT
            jp_actor.id,
            jp_actor.name,
            nickname,
            editTime,
            updateTime,
            hot,
            visited,
            addTime,
            liked,
            disabled,
            headImage,
            count( jp_actor_movie.actorId ) AS count 
        FROM
            jp_actor
            LEFT JOIN jp_actor_movie ON jp_actor.id = jp_actor_movie.actorId 
        GROUP BY
            jp_actor.id `
}