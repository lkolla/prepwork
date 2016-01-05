let http = require('http')
let request = require('request')
let path = require('path')
let fs = require('fs')
let argv = require('yargs')

let host = argv.host || 'localhost'
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout
let port = argv.port || '8000'
let destinationUrl = 'http://' + argv.host + ':' + port


http.createServer((req, res) => {
    console.log('Request received at: ${req.url}')
	
	for (let header in req.headers) {
	    res.setHeader(header, req.headers[header])
	}

	logStream.write('Request headers: ' + JSON.stringify(req.headers))
	req.pipe(logStream, {end: false})
    req.pipe(res)
    
}).listen(8000)


http.createServer((req, res) => {

    console.log('proxing url...' + req.headers['x-destination-url'])

    let url = destinationUrl;
    if(req.headers['x-destination-url']){
    	url = req.headers['x-destination-url']
    }

    let options = {
        headers: req.headers,
        url: url,
        method:req.method
    }

    let downstreamResponse = req.pipe(request(options))

	//process.stdout.write()
	logStream.write('Request headers: ' + JSON.stringify(downstreamResponse.headers))

	downstreamResponse.pipe(res)
    
}).listen(8001)