var fs = require('fs')
var stream = require('stream')
var util = require('util')
var program = require('commander')

// Transform Stream - Writeable and Readable
// takes input and find matches to the given expression
function TransformStream(pattern){
	if(!(this instanceof TransformStream)){
		return(new TransformStream(pattern))}


	stream.Transform.call(
		this,{objectMode:true});

	// RegExp object in JS
	// g = modifier to perform a global match
	if(!(pattern instanceof RegExp)){
		pattern = new RegExp(pattern, "g");}
	
	this._pattern = this._clonePattern(pattern);

	this._inputBuffer = "";
}

util.inherits(TransformStream, stream.Transform);

TransformStream.prototype._clonePattern = function(pattern){
	var parts = pattern.toString().slice( 1 ).split( "/" );
    	var regex = parts[ 0 ];
    	var flags = ( parts[ 1 ] || "g" );
	
	if(flags.indexOf("g") === -1 ) {
       		 flags += "g";}

    	return(new RegExp(regex,flags));
};

// Flush
TransformStream.prototype._flush = function(done){
	var match = null;
	while((match = this._pattern.exec(this._inputBuffer)) !== null){
		this.push(match[0]);
	}

	this._inputBuffer="";
	this.push(null);
	
	//print the output when done()
	console.log(">>>>>>>>>>>> OUTPUT <<<<<<<<<<<<\n", output);
	done();
	
};

//Transform
TransformStream.prototype._transform = function(chunk, encoding, getNextChunk){
	console.log(">>>>>>>>> Input Chunk <<<<<<<<<<\n", chunk.toString("utf8"));

	this._inputBuffer += chunk.toString("utf8");

	var nextOffset = null
	var match = null
	while((match = this._pattern.exec(this._inputBuffer)) !== null){
		if(this._pattern.lastIndex < this._inputBuffer.length){
			// console.log("Push:", match[0]);
			this.push(match[0]);
			nextOffset = this._pattern.lastIndex;
		}else{
			nextOffset = match.index;
		}
	}
	
	if(nextOffset !== null){
		this._inputBuffer = this._inputBuffer.slice(nextOffset);

	}else{
		this._inputBuffer ="";
	}

	this._pattern.lastIndex = 0;
	getNextChunk();
};

// File Location
var inputStream = fs.createReadStream('./input-sensor.txt');

// Commander Program Module for input. Input = process.argv[3]
program.option('-p, --pattern <pattern>', 'Input Pattern such as . or ,').parse(process.argv);

// Put pattern as string
var input_pattern = "[^" + process.argv[3] + "]+";

// Put input pattern into transform stream. It will convert string -> RegExp
var transformStream = inputStream.pipe(new TransformStream(input_pattern));

var output = []

transformStream.on(
	"readable",
	function(){
		var content = null;
		while(content = this.read()){
			//console.log(content.toString("utf8"));
			output.push(content.toString("utf8").trim());
		
		}
		
	}
);
