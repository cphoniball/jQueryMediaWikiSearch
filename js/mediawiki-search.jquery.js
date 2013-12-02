var mediawikiSearch = function() {

	var _generateRequestURL = function(endpoint, term, limit, format) {
		return endpoint + '?action=opensearch&format=' + format  + '&search=' + term + '&limit=' + limit;
	}

	var _formQueryURL = function(endpoint, term, limit) {
		term = term.replace(/ /g, '%20'); // need to enable global paramater on replace regex
		return endpoint + '?action=opensearch&search=' + term + '&limit=' + limit + '&format=xml';
	}

	// counts down for multiple async calls
	// executes callback once the count reaches 0
	// from so http://stackoverflow.com/questions/9431597/unit-testing-ajax-requests-with-qunit
	var createAsyncCounter = function(count, callback) {
		count = count || 1;
		return function() { --count || callback(); };
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
			}
		});
	}

	// Delegates the request to the mediawiki API to a server-side function to overcome cross-domain limitations on transmitting XML data
	// Params:
	//   internalURL: URL to the PHP function that will call the mediawiki
	//   endpoint: endpoint of the mediawiki API that you're calling
	//   terms: an array of search terms
	//   limit: number of search results to receive
	// Return: An array of jqXHR deferred object or objects, if there were multiple requests
	var delegateQuery = function(internalURL, endpoint, terms, limit, callback, callbackArgs) {
		var requests = [];

		var sendQuery = function(term) {
			return $.ajax({
				url: internalURL,
				method: 'POST',
				data: {
					action: 'opensearch',
					endpoint: endpoint,
					search: term,
					limit: limit || 20,
					format: 'xml',
					url: _formQueryURL(endpoint, term, limit)
				}
			});
		}

		// make all requests and add jqXHR objects into requests array
		terms.forEach(function(e, i) { requests.push(sendQuery(e)); });

		return requests;
	}

	var processResults = function(requests, callback) {
		var results = [];
		var countDown = createAsyncCounter(requests.length, extractData);
		var thisFunc = this;

		requests.forEach(function(e, i) {
			e.done(function(data, status, xhr) {
				results.push($(data).find('item'));
			}).always(countDown);
		});

		function extractData() {
			results = combineLists(results, 10);
			callback(results);
		}
	}

	// Returns a string that can be inserted as HTML
	var createRelatedItems = function(results) {
		var relatedString = '';

		function wrapHeadline(link, title) { return  '<a href="' + link + '">' + title + '</a>'; }
		function wrapBody(description) { return '<p>' + description + '</p>'; }
		function wrapItem(e) {
			var headline = $(e).find('text').text();
			var url = $(e).find('url').text();
			var description = $(e).find('description').text();

			return '<div class="related-item">' + wrapHeadline(url, headline) + wrapBody(description) + '</div>';
		}

		results.forEach(function(e, i) {
			relatedString += wrapItem(e);
		});

		$('.xml-results').html(relatedString);
		return relatedString;
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
		search: makeOpenSearchRequest,
		multiSearch: multiTermSearch,
		delegateQuery: delegateQuery,
		processResults: processResults,
		createRelatedItems: createRelatedItems,
		formURL: formURL,
		formURLs: formURLs,
		generateList: generateListMarkup,
		combineLists: combineLists,
		asyncCounter: createAsyncCounter
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
	var mw = mediawikiSearch;
	var $appendTo = this;
	var countDown = mw.asyncCounter(terms.length, insertList)
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
