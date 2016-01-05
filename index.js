let http = require('http')
let request = require('request')
let path = require('path')
let fs = require('fs')
let argv = require('yargs')
    .default('host', '127.0.0.1')
    .argv

let logPath = argv.log && path.join(__dirname, argv.log)

console.log(logPath)

let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

let scheme = 'http://'

// Build the destinationUrl using the --host value
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)

// Update our destinationUrl line from above to include the port
let destinationUrl = argv.url || scheme + argv.host + ':' + port


http.createServer((req, res) => {
    console.log('Request received at: ${req.url}')
	
	for (let header in req.headers) {
	    res.setHeader(header, req.headers[header])
	}

	logStream.write('Request headers: ' + JSON.stringify(req.headers))
	req.pipe(logStream, {end: false})
    req.pipe(res)
    //res.end('hello world \n')
}).listen(8000)


http.createServer((req, res) => {
  console.log(`Proxying request to: ${destinationUrl + req.url}`)
    
    console.log('requested url...' + req.headers['x-destination-url'])

    let url = destinationUrl;
    if(req.headers['x-destination-url']){
    	url = req.headers['x-destination-url'];
    }
    

    let options = {
        headers: req.headers,
        url: url + req.url
    }

    options.method = req.method

    let downstreamResponse = req.pipe(request(options))

	//process.stdout.write()
	logStream.write('Request headers: ' + JSON.stringify(downstreamResponse.headers))

	downstreamResponse.pipe(logStream, {end: false})
	downstreamResponse.pipe(res)

	//req.pipe(request(options)).pipe(res)
}).listen(8001)