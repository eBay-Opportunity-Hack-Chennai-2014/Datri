<?php
	error_reporting(E_ALL);
	header('Content-Type: application/json');
	
	$icons = array("fa-info","fa-signal","fa-exclamation","fa-thumbs-up","fa-tag");
	$colors = array("rgb(46, 204, 113)","rgb(39, 174, 96)", "rgb(52, 152, 219)" ,"rgb(41, 128, 185)", "rgb(241, 196, 15)","rgb(243, 156, 18)", "rgb(230, 126, 34)", "rgb(211, 84, 0)","rgb(231, 76, 60)","rgb(192, 57, 43)");

	$request = json_decode($_GET["query"],true);
	$colorLength = sizeOf($colors);
	$spaceLevel = 0;
	$timeLevel = 0;
	$spaceList = array("country","state","city","location");
	$timeList = array("year","month");
	foreach($spaceList as $space){
		if (array_key_exists($space, $request)) {
		    $spaceLevel++;
		}
	}
	foreach($timeList as $time){
		if (array_key_exists($time, $request)) {
		    $timeLevel++;
		}
	}
	
	$query = array();
	
	$dimensions = array("space"=>array("currentLevel"=>$spaceLevel, "allLevels" => $spaceList),"time"=>array("currentLevel"=>$timeLevel, "allLevels" => $timeList));
	//print_r($dimensions);
	function emptyQuery($spaceLevel,$spaceList,$timeLevel,$timelist,$dimensions, $request){
		$dbhost = 'localhost';
		$dbport = '28017';
		$dbname = 'daatri';
		$m = new MongoClient("mongodb://" . $dbhost);  
		$db = $m->$dbname;
		$collection = $db->events;
		$total = array("space"=>0,"time"=>0);
		$count = 0;
		$countForColors = 0;
		$dimensionCount = array("space"=>0,"time"=>0);
		$output = array();
		foreach($dimensions as $dimension=> $each_dimension){
			$current_id = array($each_dimension["allLevels"][$each_dimension["currentLevel"]] => "$" . $each_dimension["allLevels"][$each_dimension["currentLevel"]]);
			$groupByFromRequest = array();
			foreach($request as $key=>$value){
				$groupByFromRequest[$key] = "$" . $key;
			}
			$groupByKey = array_merge($current_id, $groupByFromRequest);
			$query = array(
						array(
						'$group' => array(
								"_id"=>$groupByKey,
								"total"=>array('$sum'=>'$count')
							))
					);

			$cursor = $collection->aggregate($query);
			foreach($cursor["result"] as $i){

				$match = true;
				foreach($request as $key=>$value){
					if($value != $i["_id"][$key]){
						$match = false;
						break;
					}
				}
				if($match == false){
					continue;
				}
				$icon = $GLOBALS['icons'][array_rand( $GLOBALS['icons'])];
				$output[$count]["id"] = "card-other-" . uniqid();
				$output[$count]["icon"] = $icon;
	 			$output[$count]["heading"] = $i["_id"][$each_dimension["allLevels"][$each_dimension["currentLevel"]]];
	 			if($output[$count]["heading"] == ""){
	 				$output[$count]["heading"] = "Other";
	 			}
	 			$output[$count]["text"] = $i["total"];
	 			$month;
	 			if($dimension == "time" && $timeLevel == 1){
	 				$output[$count]["heading"] = getMonthNameFromNumber($output[$count]["heading"]);
	 			}
	 			$output[$count]["dimension"] = $dimension;
	 			$output[$count]["query"] = $i["_id"];
	 			$output[$count]["cardtype"] = "summary-card";
	 			$total[$dimension] += $i["total"];
	 			$count++;
	 			$dimensionCount[$dimension]++;
			}
			usort($output,"cmp");
			$colorIndex = 0;
			$colorIncrement = $GLOBALS['colorLength'] / sizeOf($output);
			for ($i = 0; $i < sizeOf($output); $i++){
				
				if($colorIndex >= sizeOf($GLOBALS['colors'])){
					$colorIndex = sizeOf($GLOBALS['colors']) - 1;
				}
				$color = $GLOBALS['colors'][floor($colorIndex)];
				$output[$i]["color"] = $color;
				$output[$i]["orderindex"] = $countForColors;
				$countForColors++;
				$colorIndex += $colorIncrement;
			}
		}
		$json_output = "";
		$json_output = json_encode($output);
		echo $json_output;

	}

	function getMonthNameFromNumber($monthNum){
		$monthName;
		switch($monthNum){
			case "1":
				 $monthName = "January";
				 break;
			case "2":
				$monthName = "February";
				break;
			case "3":
				$monthName = "March";
				break;
			case "4":
				$monthName = "April";
				break;
			case "5":
				$monthName = "May";
				break;
			case "6":
				$monthName = "June";
				break;
			case "7":
				$monthName = "July";
				break;
			case "8":
				$monthName = "August";
				break;
			case "9":
				$monthName = "September";
				break;
			case "10":
				$monthName = "October";
				break;
			case "11":
				$monthName = "November";
				break;
			case "12":
				$monthName = "December";
				break;
			default:
				$monthName = "Unknown";
		}
		return $monthName;

	}

	function cmp($a, $b)
	{
	    return ($a["text"] > $b["text"]) ? 0 : 1;
	}
	emptyQuery($spaceLevel,$spaceList,$timeLevel,$timeList,$dimensions,$request);
?>