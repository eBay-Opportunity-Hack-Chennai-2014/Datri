var availableTagTypes = ["product", "uncategorized"]; //TO-DO: Get via ajax
function getSummaryCardsModel() {
	var model = [];
	var icons = ["fa-info","fa-signal","fa-exclamation","fa-thumbs-up","fa-tag"];
	var text = ["Maharashtra","Tamil Nadu","New Delhi","Uttar Pradesh","Karanataka"];
	var mDimensions = ["space","time"];
	var colors = ["#FFF", "rgb(102, 204, 221)","rgb(255, 187, 34)","rgb(187, 229, 53)","rgb(181, 197, 197)","rgb(245, 101, 69)"];
	for (var i = 0; i < 20; i++) {
		var data = {
			"id" : "card-summary-"+guid(),
			"cardtype" : "summary-card",
			"icon" : randomElement(icons),
			"heading" : Math.floor((Math.random()*9999)),
			"text" : randomElement(text),
			"color" : randomElement(colors),
			"orderindex" : i,
			"query" : {"country": "India"} ,
			"dimension" : randomElement(mDimensions)
		};
		model.push(data);
	}
	return model;
}

function randomElement(arr) {
	return arr[Math.floor(Math.random()*arr.length)];
}