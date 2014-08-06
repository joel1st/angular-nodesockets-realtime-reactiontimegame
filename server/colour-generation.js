
exports.randTimeGenerator = function(){
	return timeToGenerate = (Math.random()*3000)+1500;
};

exports.colourGenerator = function(){
	var hexColour = [];
	var colourGeneration = function(){
		var randomColour = Math.floor(Math.random()*15);
		if(randomColour<10){
			return randomColour;
		}
		return String.fromCharCode(87 + randomColour);
	}

	for (var i = 0; i<6; i++){
		hexColour.push(colourGeneration());
	}

	return hexColour.join('');
};