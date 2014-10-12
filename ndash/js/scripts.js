var colortimer = false;
var $container = $('.card-container');
var zoomContainer, windowWidth, windowHeight;
var cardsModel = [];
var preventOrderUpdate = true;
var containerSizeTimeout;
var query = {};
var isMockup = false;
var dimensions = ["space","time"];
var dimensionLevels = {};
dimensionLevels["space"] = ["country","state","city","location"];
dimensionLevels["time"] = ["year","month"];
var currentDimensionIndex = 0;
var serviceURI = "ndashserver.php";
$(document).ready(function() {	
	// initialize
	getCardsModel();
	initZoom();
	initView();
	$("#search-query").keypress(handleSearchInput);
	$("#card-container-wrapper").click(cardContainerClickHandler);
});

function cardContainerClickHandler(event) {
	if ( !$(".card").is(event.target) && $(".card").has(event.target).length === 0 && (event.ctrlKey || event.metaKey) ) {
		zoomOut();
	}
}

function handleSearchInput(event) {
	if ( event.which == 13 ) {
 		event.preventDefault();
 		var queryText = $(this).val();
 		if ( queryText ) {
 			preventOrderUpdate = true;
 			search(queryText);
 		} else {
 			preventOrderUpdate = true;
 			$container.empty();
			$container.packery('destroy');
 			initView();
 		}
	}
}

function search(queryText) {
	var i;
	var cardsToShow = [];
	for( i = 0; i < cardsModel.length; i++) {
		var cardText = JSON.stringify(cardsModel[i]).toLowerCase();
		var cardId = cardsModel[i].id;
		if ( cardText.indexOf(queryText) >= 0 ) {
			cardsToShow.push(cardId);
		}
	}
	$container.fadeOut('slow',function(){
		$container.empty();
		$container.packery('destroy');
		initView(cardsToShow);
	})
}

function initView(cardsToShow) {
	$('.card-container').html(generateCardsHtml(dimensions[currentDimensionIndex],cardsToShow));
	$('#dimension').html(dimensions[currentDimensionIndex]);
	var result;
	dust.render("query-title", query, function(err, res) {
	    result = res;
	});
	$('#dimension').append(result);
	initCards();
	masonryLayout();
	$container.imagesLoaded( function(){
		masonryLayout();
		$("#card-container-wrapper").css("visibility","visible"); // To prevent cards from appearing irregularly before masonry has executed
	});
	dashboardNavigation();
	$container.fadeIn('fast');
}

function initCards(forNewCard) {
	var newCardSelector = "";
	$(".card"+newCardSelector).click(function (event) {
		var cardButtons = $(this).find(".card-buttons").get(0);
		var topMenu = $(this).find(".top-menu").get(0);
		var title = $(this).find(".title").get(0);
		var description = $(this).find(".description").get(0);
		var cardId = $(this).attr("id");
		var clickTarget = event.target;
		if (cardButtons.contains(clickTarget)) {
			//console.log("bottom menu clicked inside card");
			//return false; //returning false breaks the more button => using else if
		} else if (topMenu.contains(clickTarget)) {
			//console.log("top menu clicked inside card");
			//console.log(event.target);
			//return false; //returning false breaks the more button => using else if
		} else {
			if (!(event.ctrlKey || event.metaKey)) { 
				//write code to handle simple click here
				if($(clickTarget).attr("data-editable") == "true" || $(clickTarget).parents(".title , .description").attr("data-editable") == "true") {
					$(clickTarget).attr("contenteditable","true");
					clickTarget.focus();
					$(clickTarget).one("blur", function() {
						$(clickTarget).attr("contenteditable","false");
						var currentCard;
						if (cardId.indexOf("new-card") == 0) {
							currentCard = newCardModel[0];
						} else {
							currentCard = filterCards({"id":cardId})[0];
						}
						if (title.contains(this)) {
							currentCard["title"] = $(this).html();
						}
						if (cardId.indexOf("new-card") != 0) {
						} else if (description.contains(this)) {
							currentCard["description"] = $(this).html();
						}
						if (cardId.indexOf("new-card") != 0) {
							postCardsModel();
						}
					});
				}
				if (clickTarget.nodeName == "INPUT") {
					clickTarget.focus();
				}
			}
			if ((event.ctrlKey ||  event.metaKey)) {
			//flip(this);
				if ($(this).hasClass("query-card")) {
					zoomTo($(this));
				}
			}
		}
	})
}

function dashboardNavigation() {
	var left = $("<div>",{
		"class" : "dashboard-navigation left-navigation",
		"css" : {
			"position" : "fixed",
			"top" : windowHeight/2+"px",
			"left" : 8 + "px"
		},
		"html" : '<h1><i class="fa fa-chevron-circle-left"></i></h1>',
		click : function() {
			slide("left");
		}
	});

	var right = $("<div>",{
		"class" : "dashboard-navigation right-navigation",
		"css" : {
			"position" : "fixed",
			"top" : windowHeight/2+"px",
			"right" : 8 + "px"
		},
		"html" : '<h1><i class="fa fa-chevron-circle-right"></i></h1>',
		click : function() {
			slide("right");
		}
	});
	$(".dashboard-navigation").remove();
	$("body").append(left);
	$("body").append(right);
	hideDisabledNavigations();
}

function hideDisabledNavigations() {
	if (currentDimensionIndex == 0) {
		$(".left-navigation").addClass("hidden");
	}
	if (currentDimensionIndex == dimensions.length-1) {
		$(".right-navigation").addClass("hidden");
	}
}

function initZoom() {
	zoomContainer = $("body");
	windowHeight = $(window).height();
	windowWidth = $(window).width();
	zoomContainer.css("transform-origin",(windowWidth/2) + "px " + (windowHeight/2) + "px");
}

function zoomTo(card) {
	var currentDimension = dimensions[currentDimensionIndex];
	var parentOfleafOfCurrentDimension = dimensionLevels[currentDimension][dimensionLevels[currentDimension].length-2];
	if (query.hasOwnProperty(parentOfleafOfCurrentDimension)) {
		console.log("already in parent of leaf");
		return;
	}
	var cardHeight = card.height();
	var cardWidth = card.width();
	var zoomFactor = 1.3;
	var scaleY = windowHeight/cardHeight*zoomFactor;
	var scaleX = scaleY;
	var scrollTop = zoomContainer.scrollTop()/scaleY;
	var cardCenterY = card.offset().top + cardHeight/2;
	var translateY = (windowHeight/2 - cardCenterY) + scrollTop;
	var cardCenterX = card.offset().left + cardWidth/2;
	var translateX = (windowWidth/2 - cardCenterX); 
	var cardId = card.attr("id");
	var currentCard = filterCards({"id":cardId})[0];

	zoomContainer.addClass("zoom-in-progress");
	zoomContainer.animate({ transform : "scale(" + scaleX + "," + scaleY + ") translate(" + translateX + "px," + translateY + "px)", opacity:0},500,function(){
		zoomContainer.removeClass("zoom-in-progress");
		$container.empty();
		$container.packery('destroy');
		query = currentCard.query; //TO-DO: Think of a better name for JSON schema
		console.log(JSON.stringify(query));
		getCardsModel(); // This will involve one single service call to load all the cards at that level
		//Load availablecardtypes here if fetching them through ajax
		initView();
		masonryLayout();
		zoomContainer.animate({ transform : "scale(" + 0 + "," + 0 + ") translate(" + 0 + "px," + 0 + "px)"},0,function(){
			zoomContainer.animate({ transform : "scale(" + 1 + "," + 1 + ")", opacity:1},800, function() {
				zoomContainer.css({transform : "none"});// Neat hack to-fix: position fixed problem inside transform() applied parent problem
			});
		});
	});
}

function zoomOut() {
	var currentDimension = dimensions[currentDimensionIndex];
	var rootOfCurrentDimension = dimensionLevels[currentDimension][0];
	var i;
	
	var leafOfQuery = dimensionLevels[currentDimension][0];
	for ( i = 0; i < dimensionLevels[currentDimension].length; i++) {
		if (query.hasOwnProperty(dimensionLevels[currentDimension][i])) {
			leafOfQuery = dimensionLevels[currentDimension][i];
		} else {
			break;
		}

	}
	if (!query.hasOwnProperty(leafOfQuery)) {
		console.log("already in root");
		return;
	}
	console.log(leafOfQuery);
	delete query[leafOfQuery];
	zoomContainer.addClass("zoom-in-progress");
	zoomContainer.animate({ transform : "scale(0,0)", opacity:0},500,function(){
		$container.empty();
		$container.packery('destroy');
		diminishQuery();
		console.log(JSON.stringify(query));
		getCardsModel(); // This will involve one single service call to load all the cards at that level
		currentcardtypeIndex = 0;
		initView();
		masonryLayout();
		zoomContainer.animate({ transform : "scale( 1.3 , 1.3 )"},0,function(){
			zoomContainer.animate({ transform : "scale( 1 , 1 )", opacity:1},800, function() {
				zoomContainer.removeClass("zoom-in-progress");
				zoomContainer.css({transform : "none"});// Neat hack to-fix: position fixed problem inside transform() applied parent problem
			});	
		});
	});
}

function diminishQuery () {
	
}

function slide(direction) {
	//TO-DO : Fix slide in and out animation speed
	preventOrderUpdate = true;
	$(".dashboard-navigation").addClass("hidden");
	var directionConstant;
	if (direction == "left") {
		if (currentDimensionIndex != 0) {
			currentDimensionIndex = ( currentDimensionIndex - 1 );
		}
		directionConstant = 1;
	} else if(direction == "right"){
		if (currentDimensionIndex != dimensions.length-1) {
			currentDimensionIndex = ( currentDimensionIndex + 1 );
		}
		directionConstant = -1;
	} else {
		throw "wrong direction";
	}
	zoomContainer.animate({ transform : "translate(" + (windowWidth*directionConstant) + "px," + 0 + "px)"},500,function(){
		$container.empty();
		$container.packery('destroy');
		initView();
		zoomContainer.animate({ transform : "translate(" + (windowWidth*directionConstant*-1) + "px," + 0 + "px)"},0,function(){
			zoomContainer.animate({ transform : "translate(" + 0 + "px," + 0 + "px)"},900,function(){
				zoomContainer.css({transform : "none"}); // Neat hack to-fix: position fixed problem inside transform() applied parent problem
			});
			$(".dashboard-navigation").removeClass("hidden");
			hideDisabledNavigations();
		});
	});
}

function getCardsModel() {
	preventOrderUpdate = true;
	if (isMockup) {
		cardsModel = [];
		cardsModel = cardsModel.concat(getSummaryCardsModel());
	} else {
		$.ajax({
	       type: "GET",
	       crossDomain:true,
	       async:false,
	       url: serviceURI,
	       datatype:"json",
	       data : {query : JSON.stringify(query)},
	       beforeSend:function(){
	       
	       },
	       error: function(xhr, ajaxOptions, thrownError){
	        console.log("error:");
	        console.log(xhr.status +" "+ thrownError);
	       },
	       success: function  (res) {
	       	console.log(res);
	       	cardsModel = res;
	       }
  		});
	}
}

function filterCards(query) {
	return sift(query, cardsModel);
}

function masonryLayout() {
	var i,j;
	for( i=0; i<$container.length; i++) {
		$($container[i]).packery({
			columnWidth: 450,
			itemSelector: '.card-static',
			isAnimated: true,
			isInitLayout: false
		});
		var pckry = $($container[i]).data('packery');
	    var orderindex;
	    var temp = [];
	    //TO-DO: Think if ordering can be optimized (do without extra space)
	    for ( j=0, len = pckry.items.length; j < len; j++ ) {
	      var item = pckry.items[j];
	      orderindex = $( item.element ).attr('data-order-index');
	      temp[orderindex] = pckry.items[j]; 
	    }
	    temp.clean(undefined); //Required to show search result where no. of elements to be shown is reduced.
	    for ( j=0, len = pckry.items.length; j < len; j++ ) {
	      pckry.items[j] = temp[j];
	    }
	    $($container[i]).packery();
		var $itemElems = $(pckry.getItemElements());
	  	$($container).packery( 'on', 'layoutComplete', layoutCompleted);
	}
}

function layoutCompleted() {
	adjustContainerSize();
}

function generateCardsHtml(dimension,cardsToShow) {
	var query = {"dimension" : dimension};
	if ( typeof(cardsToShow) === "object" && typeof(cardsToShow[0]) === "string" ) { //when ids of cards to show passed
		query = {"dimension" : dimension, "id" : {$in: cardsToShow}};
	}
	
	var modelWrapper = {};
	if ( typeof(cardsToShow) === "object" && typeof(cardsToShow[0]) === "object" ) { // when directly cloned card objects passed
		modelWrapper["cards"] = cardsToShow;
	} else {
		var filteredCards = filterCards(query);
		modelWrapper["cards"] = filteredCards;
	}

	modelWrapper["tagTypes"] = availableTagTypes;
	var result;
	dust.render("cards-template", modelWrapper, function(err, res) {
	    result = res;
	});
	return result;
}
 
/* Vertically center modals with class vertical-center */
function adjustModalMaxHeightAndPosition(){
  $(".modal.vertical-center").css("height",windowHeight+"px"); // Fix for modal position change on zoom
  $('.modal.vertical-center').each(function(){
    if(!$(this).hasClass('in')){
      $(this).show();
    };
    var contentHeight = $(window).height() - 60;
    var headerHeight = $(this).find('.modal-header').outerHeight() || 2;
    var footerHeight = $(this).find('.modal-footer').outerHeight() || 2;

    $(this).find('.modal-content').css({
      'max-height': function () {
        return contentHeight;
      }
    });

    $(this).find('.modal-body').css({
      'max-height': function () {
        return (contentHeight - (headerHeight + footerHeight));
      }
    });

    $(this).find('.modal-dialog').css({
      'margin-top': function () {
        return -($(this).outerHeight() / 2);
      },
      'margin-left': function () {
        return -($(this).outerWidth() / 2);
      }
    });
    if(!$(this).hasClass('in')){
      $(this).hide();
    };
  });
};

function adjustContainerSize() {
	if ( containerSizeTimeout ) {
		clearTimeout(containerSizeTimeout);
	}
	containerSizeTimeout = setTimeout(function  () {
		var i, dropDownHeight = 64, additionalPadding = 6;;
		for (i = 0; i < $container.length; i++) {
			var height = $($container[i]).height();
			$($container[i]).height(height+dropDownHeight+additionalPadding);
		}
	},400);
}

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if ( this[i] == deleteValue || ( typeof(deleteValue) === "object" &&  JSON.stringify(this[i]) ===  JSON.stringify(deleteValue) ) ) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
}

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4()  + s4() + s4()  +
           s4() + s4() + s4() + s4();
  };
})();

$(window).resize(initZoom);
$(window).resize(dashboardNavigation);
$(window).resize(adjustModalMaxHeightAndPosition).trigger("resize");