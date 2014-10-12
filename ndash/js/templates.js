var cardsTemplate = '{#cards}\
    {@select key=\"{cardtype}\"}\
    	{@eq value=\"summary-card\"}\
    		<div class="card card-static query-card summary {?isPlainTextCard}full-width{/isPlainTextCard}" id="{id}" data-color="{color}" data-order-index="{orderindex}" style="background:{color}">\
				{^isPlainTextCard}\
					<div class="top-menu">\
			          <div class="top-cell"><span class="glyphicon glyphicon-share"></span></div>\
			          <div class="top-cell"><span class="glyphicon glyphicon-star"></span></div>\
			        </div>\
		        {/isPlainTextCard}\
				<div class="card-front">\
					<div class="summary-text-wrp"><h2 class="summary-heading">{heading}</h2><h3 class="summary-text">{text}</h3></div>\
		        <div class="clear"></div>\
		        </div>\
		        {^isPlainTextCard}\
			        <div class="card-buttons">\
			          <div class="cell first">\
			          	<select class="colorselector">\
			          	  {@select key=\"{color}\"}\
				              <option value="1" data-color="rgb(255, 255, 255)" {@eq value=\"rgb(255, 255, 255)\"}selected{/eq}>white</option>\
				              <option value="2" data-color="rgb(102, 204, 221)" {@eq value=\"rgb(102, 204, 221)\"}selected{/eq}>blue</option>\
				              <option value="3" data-color="rgb(255, 187, 34)"  {@eq value=\"rgb(255, 187, 34)\"}selected{/eq}>orangered</option>\
				              <option value="4" data-color="rgb(187, 229, 53)"  {@eq value=\"rgb(187, 229, 53)\"}selected{/eq}>green</option>\
				              <option value="5" data-color="rgb(181, 197, 197)" {@eq value=\"rgb(181, 197, 197)\"}selected{/eq}>grey</option>\
				              <option value="6" data-color="rgb(245, 101, 69)"  {@eq value=\"rgb(245, 101, 69)\"}selected{/eq}>red</option>\
				          {/select}\
			            </select>\
			          </div>\
			          <div class="cell reminder"><span class="glyphicon glyphicon-bell" ></span></div>\
			          <div class="cell comment"><span class="glyphicon glyphicon-comment"></span></div>\
			          <div class="cell last more-menu">\
			            <span class="glyphicon glyphicon-th-large" data-toggle="dropdown"></span>\
			            <ul class="dropdown-menu right" role="menu">\
			              <li><a href="#">Copy</a></li>\
			              <li><a href="#" class="delete-card" data-card-id="{id}">Delete</a></li>\
			            </ul>\
			          </div>\
			          <div class="clear"></div>\
			        </div>\
			    {/isPlainTextCard}\
		    </div>\
    	{/eq}\
		{/select}\
	{/cards}';

var cardsTemplateCompiled = dust.compile(cardsTemplate, "cards-template");
dust.loadSource(cardsTemplateCompiled);

var queryTitleTemplate = "-view : &nbsp; {country} {state} {city} {location} {year} {month}";
var queryTitleTemplateCompiled = dust.compile(queryTitleTemplate, "query-title");
dust.loadSource(queryTitleTemplateCompiled);

var newCardModel = [];
initNewCardModel();
function initNewCardModel() {
	newCardModel.length = 0;
	newCardModel = [{
		"isNewCard" : true,
		"id" : "new-card-id",
		"cardtype" : "new-card",
		"title" : "Enter Title",
		"color" : "rgb(255, 255, 255)",
		"description" : "Enter description",
		"tags" : [],
		"orderindex" : 0
	}];
}