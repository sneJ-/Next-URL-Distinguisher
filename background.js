chrome.commands.onCommand.addListener(function(command) {
		getCurrentTab(function(tab){
			var newUrl = distinguishNewUrl(tab.url, command);
			if (newUrl != undefined){
				chrome.tabs.update(tab.id, {"url": newUrl});
			}
		});
});

/**
* Distinguishes the new Url to load
**/
function distinguishNewUrl(url, command){
	var newUrl;
//	console.log('Command:', command);
//	console.log('Original URL:', url);
	var queryResult = url.match(/\d+/g);
//	console.log('Query Result:', queryResult);
	if (queryResult.length > 0){
		var lastNumber = queryResult[queryResult.length-1];
//		console.log('Last Number:', lastNumber);
		var splittedString = url.split(lastNumber);
//		console.log('Splitted String:', splittedString);
		//Only replace the last appearance
		if (splittedString.length > 2){
			splittedString.reverse();
			while(splittedString.length > 2){
				splittedString[splittedString.length-2] = splittedString[splittedString.length-1].concat(lastNumber).concat(splittedString[splittedString.length-2]);
				splittedString.pop();
			}
			splittedString.reverse();
//			console.log('Splitted String 2:', splittedString);
		}
		if (command == "previous-page" && parseInt(lastNumber)>0){
			var newLastNumber = parseInt(lastNumber)-1;
		}
		else if (command == "next-page"){
			var newLastNumber = parseInt(lastNumber)+1;
		}
//		console.log('New Last Number:', newLastNumber);
		//Deal with beginning zeros in last number
		if(lastNumber.match(/^0/g)){
			var tempLastNumber = parseInt(lastNumber);
			var zerosToAdd = lastNumber.match(/^0+/g)[0].length + tempLastNumber.toString().length - newLastNumber.toString().length;
//			console.log('Zeros to Add:', zerosToAdd);
			for (i=0; i<zerosToAdd; i++){
				splittedString[0] = splittedString[0].concat("0");
			}
//			console.log('Splitted String with added Zeros:', splittedString);
		}
		newUrl = splittedString[0].concat(newLastNumber.toString()).concat(splittedString[1]);
	}
//	console.log('New URL:', newUrl);
	return newUrl;
}


/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 **/
function getCurrentTab(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof tab.url == 'string', 'tab.url should be a string');

    callback(tab);
  });
}