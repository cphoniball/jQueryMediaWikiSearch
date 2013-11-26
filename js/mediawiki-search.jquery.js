var mediawikiSearch = function() {

	var _generateRequestURL = function(endpoint, term, limit, format) {
		return endpoint + '?action=opensearch&format=' + format  + '&search=' + term + '&limit=' + limit;
	}

	// Changes XML to JSON
	var xmlToJson = function(xml) {

		// Create the return object
		var obj = {};

		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(xmlToJson(item));
				}
			}
		}
		return obj;
	};

	// counts down for multiple async calls
	// executes callback once the count reaches 0
	// from so http://stackoverflow.com/questions/9431597/unit-testing-ajax-requests-with-qunit
	var createAsyncCounter = function(count) {
		count = count || 1;
		console.log('Count = ' + count);
		return function() { --count || callback; };
	}

	// Makes a search request and jqXHR object
	// Params:
	// 	host: Hostname for the mediawiki you're making an api call to, e.g. wikipedia.org
	//  term: Search term
	//  limit: Number of results
	var makeSearchRequest = function(endpoint, term, limit) {
		return $.ajax({
			url: endpoint,
			method: 'GET',
			dataType: 'jsonp',
			data: {
				action: 'query',
				list: 'search',
				format: 'json',
				srsearch: term,
				srlimit: limit || 10
			}
		});
	}

	// Makes an Opensearch request. Since data is requested to be returned in json format
	// the mediawiki API returns only the titles
	// Params:
	//   endpoint: endpoint for the API of the wiki you are searching
	//   term: search term - API allows only one term per request
	//   limit: how many search results to cut off at
	var makeOpenSearchRequest = function(endpoint, term, limit, format) {
		return $.ajax({
			url: endpoint,
			method: 'POST',
			dataType: 'jsonp text xml',
			data: {
				action: 'opensearch',
				search: term,
				limit: limit || 10,
				format: format || 'json'
			},
			success: function(data) {
				console.log(data);
			},
			error: function(xhr, status, error) {
				console.log('There was an error ' + error);
			}

		});
	}

	var delegateQuery = function(endpoint, term, limit) {
		return $.ajax({
			url: 'http://localhost:8888/mwapisearch/functions.php',
			method: 'POST',
			data: {
				action: 'opensearch',
				endpoint: endpoint,
				search: term,
				limit: limit || 20,
				format: 'xml'
			}
		});
	}

	// endpoint: string, endpoint of wiki api
	// titles: array of strings to query
	var makeQueryRequest = function(endpoint, titles) {
		var titlestring = titles.join('|');
		return $.ajax({
			url: endpoint,
			method: 'GET',
			dataType: 'jsonp',
			data: {
				action: 'query',
				titles: titlestring,
				format: 'json',
				prop: 'info|images',
				inprop: 'url', // information to retrieve
				imlimit: 1 // number of images to retrieve
			}
		});
	}



	// Executes multiple searches for each term in an array
	// Returns an array of jqXHR objects that will allow execution through a deferred object
	var multiTermSearch = function(endpoint, terms, limit) {
		var requests = [];
		terms.forEach(function(e, i, array) {
			requests.push(makeOpenSearchRequest(endpoint, e, limit));
		});
		return requests;
	}

	// Parses a single URL based on the baseURL and title
	// Title should be modified as follows:
	// 1. Each word has the first letter capitalized
	// 2. All words are concatenated with an underscore between each word
	// Arguments:
	//   baseURL: baseURL with trailing slash
	//   title: Article title, should have no punctuation
	var formURL = function(baseURL, title) {
		if (!title) return baseURL;
		return baseURL + title.split(' ').map(function(e, i) {
			return e[0].toUpperCase() + e.substring(1, e.length);
		}).join('_');
	};

	// Parses titles returned from Opensearch into valid URls
	// Arguments:
	//    baseUrl: baseUrl with trailing slash
	//    titles: Array of post titles
	// Returns: Array of properly formatted URLs
	var formURLs = function(baseURL, titles) {
		return titles.map(function(e, i) {
			return formURL(baseURL, e);
		});
	};

	// Takes any number of arrays and combines them by index rather than concatenating them
	// e.g. list1[0] + list2[0] + list1[1] + list2[1] ...
	// Once the lists are combined, finds any duplicates and moves them to the front
	// before cutting off at limit items and returning the new array
	// All lists should be same length, although function can handle lists of variable lengths
	// Arguments:
	//    lists: Array of arrays
	//    limit: limit that the final list should be cut off at
	var combineLists = function(lists, limit) {
		var maxLength = 0;
		var combined = [];
		var uniques = [];
		// get maxLength of the arrays
		lists.forEach(function(e) {
			if (e.length > maxLength) maxLength = e.length;
		});
		for (var i = 0; i < maxLength; i++) {
			lists.forEach(function(e, j) {
				// push the ith element of each array onto the combined array
				if (e.length > i) { combined.push(e[i]); }
			});
		}
		combined.forEach(function(e, i) {
			console.log(uniques);
			var index = uniques.indexOf(e);
			if (index === -1) uniques.push(e);
			else {
				uniques.splice(index, 1);
				uniques.unshift(e);
			}
		});
		return uniques.slice(0, limit);
	}

	var generateListItemMarkup = function(title, url) {
		return '<li><a href="' + url + '">' + title + '</a></li>';
	};

	var generateListMarkup = function(titles, urls) {
		var markupArray = titles.map(function(e, i) {
			return generateListItemMarkup(e, urls[i]);
		});
		return markupArray.join('');
	}


	return {
		search: makeSearchRequest,
		xmlToJson: xmlToJson,
		openSearch: makeOpenSearchRequest,
		multiSearch: multiTermSearch,
		delegateQuery: delegateQuery,
		formURL: formURL,
		formURLs: formURLs,
		generateList: generateListMarkup,
		combineLists: combineLists,
		createAsyncCounter: createAsyncCounter,
		query: makeQueryRequest
	}

}();

$.fn.appendMediawikiResultsList = function(endpoint, term, limit, baseURL) {
	var mw = mediawikiSearch;
	var $appendTo = this;
	mw.openSearch(endpoint, term, limit).done(function(data, status, xhr) {
		var urls = mw.formURLs(baseURL, data[1]);
		var titles = data[1];
		var listMarkup  = mw.generateList(titles, urls);
		$appendTo.append(listMarkup);
	});
};

$.fn.appendMultiTermResults = function(endpoint, terms, limit, baseURL, callback) {
	function createAsyncCounter(count) {
		count = count || 1;
		return function() { --count || insertList(); };
	}

	var mw = mediawikiSearch;
	var $appendTo = this;
	var countDown = createAsyncCounter(terms.length);
	var requests = mw.multiSearch(endpoint, terms, limit);
	var resultsArray = [];

	requests.forEach(function(e, i, array) {
		e.done(function(data, status, xhr) {
			resultsArray.push(data[1]);
			console.log(resultsArray);
		}).always(countDown);
	});

	// This will be called only after countdown reaches 0
	function insertList() {
		var titles = mw.combineLists(resultsArray, limit);
		console.log('The titles are ' + titles);
		var urls = mw.formURLs(baseURL, titles);
		console.log('The urls are ' + urls);
		$appendTo.append(mw.generateList(titles, urls));
		callback();
	}
};
