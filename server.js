const fs = require('fs')
const path = require('path')
const express = require('express')
const upload = require('express-fileupload')
const app = express()
const server = require('http').Server(app)
const formidable = require('formidable')

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
        res.redirect('/')
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


app.post('/room', (req,res) => {
    var formData = formidable.IncomingForm()
    formData.parse(req, function(error,fields,files){

        var ext = files.file.name.split('.')[files.file.name.split('.').length-1]
        if (rooms[fields.streamid] != null || ext != 'mp4'){
            return res.redirect('/')
        } 
        else{
            rooms[fields.streamid] = {"users" : {} }
            var newPath = "./uploads/" + fields.streamid + '.' + ext;
            fs.rename(files.file.path, newPath, function (errorRename) {
                res.redirect(fields.streamid)
            })
        }
    })
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

server.listen(8000)