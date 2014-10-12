var x =db.events.aggregate([{"$group":{"_id":{"year":"$year","country":"$country","state":"$state"},"total":{"$sum":"$count"}}}]);
print(JSON.stringify(x));
