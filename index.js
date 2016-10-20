"use strict"

let http = require('http')
let fs = require('fs')
let request = require('request')



let argv = require('yargs').argv

let logStream = argv.logfile ? fs.createWriteStream(argv.logfile) : process.stdout
//cli >> --logfile log.txt

let localhost = '127.0.0.1'
let scheme = 'http://'
let host = argv.host || localhost
let port = argv.port || (host === localhost ? 8000 : 80)
let destinationUrl = scheme + host + ':' + port

let echoServer = http.createServer((req, res) => {
	logStream.write('echoServer\n');
	for (let header in req.headers) {
		res.setHeader(header, req.headers[header])
	}
	logStream.write(JSON.stringify(req.headers)+'\n')

	req.pipe(res)
	
})
//listen on port 8000
echoServer.listen(8000)
logStream.write('echoServer listening @ 127.0.0.1:8000\n')
//terminal command >> curl http://127.0.0.1:8000


let proxyServer = http.createServer((req, res) => {
	logStream.write('proxyServer\n');
	logStream.write(JSON.stringify(req.headers)+'\n')

	let url = destinationUrl 
	if (req.headers['x-destinations-url'])
		url = 'http://' + req.headers['x-destinations-url']
	

	let options = {
		url: url + req.url
	}

	req.pipe(request(options)).pipe(res) 
})

proxyServer.listen(9000)

logStream.write('proxyServer listening @ 127.0.0.1:9000\n')


