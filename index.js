const fs = require('fs');
const path = require('path');
const app = require('express')();
// const app = express();
const PORT = 3003;

app.get('/', (req, res)=>{
    return res.status(200).send("Welcome to Artur's Streaming")
})

app.get('/music/:song', (req, res)=>{

    const { song } = req.params
    if ( !song ) return res.status(400).send("Someting went wrong with the request");

    const filePath = path.join(__dirname, 'music', path.basename(song))
    if( !fs.existsSync(filePath) ) return res.status(404).send("Music not found")
    
    const { range = "bytes=0-"} = req.headers;
    
    const fileSize = fs.statSync(filePath).size
    
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
    const contentLength = end - start + 1

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "audio/mp3"
    }

    res.writeHead(206, headers)
    const audioStream = fs.createReadStream(filePath, {start, end})
    return audioStream.pipe(res)
})

app.listen(PORT, ()=>{
    console.log( `✅ Express: ${PORT}` );
})
