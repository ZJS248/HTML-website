const path = require('path')
const fs = require('fs')
exports.stream = (req, res, root, filename) => {
    const file = path.resolve(root, filename)
    fs.stat(file, (err, stats) => {
        if (err) {
            res.send('404')
        }
        const range = req.headers.range;
        if (!range) {
            return res.sendStatus(416)
        }
        const position = range.replace(/bytes=/, "").split("-");
        const start = parseInt(position[0], 10);
        const total = stats.size;
        const end = position[1] ? parseInt(position[1], 10) : total - 1;
        const chunksize = (end - start) + 1;

        res.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4"
        })

        const stream = fs.createReadStream(file, { start, end })
        stream.on('open', () => stream.pipe(res)).on('error', (err) => res.end(err))
    })
}