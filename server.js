const http = require('http')
const fs = require('fs')
const path = require('path')

http.createServer((req,res) => {
    const file = req.url === '/' ? 'index.html' : req.url
    const filePath = path.join(__dirname,'public',file)
    const extname = path.extname(filePath)

    const allowedFileTypes = ['.html','.css','.js','.png','.jpg']
    const allowed = allowedFileTypes.find(item => item == extname)


    if(extname == '.html'){
        fs.readFile(
            path.join(__dirname,'public',file),
            (err,content) => {
                if(err) throw err
    
                res.end(content)
            }
        )
    }

    else if(extname == '.css'){
        fs.readFile(
            path.join(__dirname,'public/styles','style.css'),
            (err,content) => {
                if(err) throw err

                res.end(content)
            }
        )
    }

    else if(extname == '.png' || extname == '.jpg'){
        fs.readFile(
            path.join(__dirname,'./public',file.toString()),
            (err,content) => {
                if(err) throw err

                res.end(content)
            }
        )
    }

    else if(file == '/video'){
        const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = "bigbuck.mp4";
  const videoSize = fs.statSync("bigbuck.mp4").size;

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
    }

    else{
        fs.readFile(
            path.join(__dirname,'public',"index.html"),
            (err,content) => {
                if(err) throw err
    
                res.end(content)
            }
        )
    }


}).listen(8000,() => console.log('Server running on port 8000'))