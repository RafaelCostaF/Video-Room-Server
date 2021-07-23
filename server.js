const fs = require('fs')
const path = require('path')
const express = require('express')
const upload = require('express-fileupload')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views','./public')
app.set('view engine','ejs')
app.use(express.static('./public/scripts'))
app.use(express.urlencoded({extended : true}))

const rooms ={}


app.get('/', (req,res) => {
    res.render('index', {rooms:rooms})
})

app.get('/styles/style.css', (req,res) => {
        fs.readFile(
        path.join(__dirname,'./public/styles','style.css'),
        (err,content) => {
            if(err) throw err

            res.end(content)
        }
    )
})

app.get('*.css',(req,res) => {
    fs.readFile(
        path.join(__dirname,'./public',req.url),
        (err,content) => {
            if(err){
                path.join(__dirname,'./public','index')
                throw err
            } 

            res.end(content)
        }
    )
})

app.get('*.png',(req,res) => {
    fs.readFile(
        path.join(__dirname,'./public',req.url),
        (err,content) => {
            if(err){
                path.join(__dirname,'./public','index')
                throw err
            } 

            res.end(content)
        }
    )
})

app.get('*.jpg',(req,res) => {
    fs.readFile(
        path.join(__dirname,'./public',req.url),
        (err,content) => {
            if(err){
                path.join(__dirname,'./public','index')
                throw err
            } 

            res.end(content)
        }
    )
})

app.get("/video", (req,res) => {

    var filename = req.headers.referer.split('/')
    filename = './uploads/' + filename[filename.length-1] + '.mp4'
    if(fs.existsSync(filename)){
        var videoPath = filename
        var videoSize = fs.statSync(filename).size
    } else{
        // get video stats (about 61MB)
        var videoPath = "./uploads/bigbuck.mp4";
        var videoSize = fs.statSync("./uploads/bigbuck.mp4").size;
    }
    
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    
    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    
    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    
    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);
    
    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });
    
    // Stream the video chunk to the client
    videoStream.pipe(res);
})

app.use(upload())

app.post('/upload',(req,res) =>{
    if(req.files){
        var file = req.files.file
        var ext = path.extname(file.name||'').split('.')
        var filename = req.headers.referer.split('/')
        filename = filename[filename.length-1] + '.' + ext[ext.length-1]
        file.mv('./uploads/'+filename,function (err){
            if(err){
                res.send(err)
            } else{
                res.redirect(req.headers.referer)
            }
        })
    }
})

app.get('/:room', (req,res) => {
    if(rooms[req.params.room] == null){
        return res.redirect('/')
    }
    res.render('room',{ roomName : req.params.room})
})

app.post('/joinroom' , (req,res) => {
    if (rooms[req.body.streamid] == null){
        return res.redirect('/')
    }
    else return res.redirect(req.body.streamid)
})

app.post('/room', (req,res) => {
    if (rooms[req.body.streamid] != null){
        return res.redirect('/')
    }
    rooms[req.body.streamid] = { users : {}}
    res.redirect(req.body.streamid)
})

server.listen(8000)

// io.on('connection', socket => {
//     socket.on('new-user',(room,name) =>{
//         socket.join(room)
//         rooms[room].users[socket.id] = name
//         socket.to(room).broadcast.emit('user-connected',name)
//     })
//     socket.on('disconnect',(room,name) =>{
//         socket.to(room).broadcast.emit('user-disconnected',name)
//         delete rooms[room].users[name]
//     })
// })

// http.createServer((req,res) => {
//     const file = req.url === '/' ? 'index.html' : req.url
//     const filePath = path.join(__dirname,'public',file)
//     const extname = path.extname(filePath)

//     const allowedFileTypes = ['.html','.css','.js','.png','.jpg']
//     const allowed = allowedFileTypes.find(item => item == extname)


//     if(extname == '.html'){
//         fs.readFile(
//             path.join(__dirname,'public',file),
//             (err,content) => {
//                 if(err) throw err
    
//                 res.end(content)
//             }
//         )
//     }

//     else if(extname == '.css'){
//         fs.readFile(
//             path.join(__dirname,'public/styles','style.css'),
//             (err,content) => {
//                 if(err) throw err

//                 res.end(content)
//             }
//         )
//     }

//     else if(extname == '.png' || extname == '.jpg'){
//         fs.readFile(
//             path.join(__dirname,'./public',file.toString()),
//             (err,content) => {
//                 if(err) throw err

//                 res.end(content)
//             }
//         )
//     }

//     else if(file == '/video'){
//         const range = req.headers.range;
//   if (!range) {
//     res.status(400).send("Requires Range header");
//   }

//   // get video stats (about 61MB)
//   const videoPath = "bigbuck.mp4";
//   const videoSize = fs.statSync("bigbuck.mp4").size;

//   // Parse Range
//   // Example: "bytes=32324-"
//   const CHUNK_SIZE = 10 ** 6; // 1MB
//   const start = Number(range.replace(/\D/g, ""));
//   const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

//   // Create headers
//   const contentLength = end - start + 1;
//   const headers = {
//     "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//     "Accept-Ranges": "bytes",
//     "Content-Length": contentLength,
//     "Content-Type": "video/mp4",
//   };

//   // HTTP Status 206 for Partial Content
//   res.writeHead(206, headers);

//   // create video read stream for this particular chunk
//   const videoStream = fs.createReadStream(videoPath, { start, end });

//   // Stream the video chunk to the client
//   videoStream.pipe(res);
//     }

//     else{
//         fs.readFile(
//             path.join(__dirname,'public',"index.html"),
//             (err,content) => {
//                 if(err) throw err
    
//                 res.end(content)
//             }
//         )
//     }


// }).listen(8000,() => console.log('Server running on port 8000'))