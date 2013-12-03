var mediawikiSearch = function() {

	var _generateRequestURL = function(endpoint, term, limit, format) {
		return endpoint + '?action=opensearch&format=' + format  + '&search=' + term + '&limit=' + limit;
	}

	var _formQueryURL = function(endpoint, term, limit) {
		term = term.replace(/ /g, '%20'); // need to enable global paramater on replace regex
		return endpoint + '?action=opensearch&search=' + term + '&limit=' + limit + '&format=xml';
	}

	// Takes any number of arrays and combines them by index rather than concatenating them
	// e.g. list1[0] + list2[0] + list1[1] + list2[1] ...
	// Once the lists are combined, finds any duplicates and moves them to the front
	// before cutting off at limit items and returning the new array
	// All lists should be same length, although function can handle lists of variable lengths
	// Arguments:
	//    lists: Array of arrays
	//    limit: limit that the final list should be cut off at
	var _combineLists = function(lists, limit) {
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
			if (index === -1) uniques.push(e); // if element is not already on array push new element on
			else { // if duplicate move up to front of the array
				uniques.splice(index, 1);
				uniques.unshift(e);
			}
		});
		return uniques.slice(0, limit);
	}

	// counts down for multiple async calls
	// executes callback once the count reaches 0
	// from so http://stackoverflow.com/questions/9431597/unit-testing-ajax-requests-with-qunit
	var _createAsyncCounter = function(count, callback) {
		count = count || 1;
		return function() { --count || callback(); };
	}

	// Delegates the request to the mediawiki API to a server-side function to overcome cross-domain limitations on transmitting XML data
	// Handles both single and multi-term requests
	// Params:
	//   internalURL: URL to the PHP function that will call the mediawiki
	//   endpoint: endpoint of the mediawiki API that you're calling
	//   terms: an array of search terms
	//   limit: number of search results to receive
	// Return: An array of jqXHR deferred object or objects, if there were multiple requests
	var delegateQuery = function(internalURL, endpoint, terms, limit) {
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

	var processResults = function(requests, limit, callback) {
		var results = [];
		var countDown = _createAsyncCounter(requests.length, extractData);
		var thisFunc = this;

		requests.forEach(function(e, i) {
			e.done(function(data, status, xhr) {
				results.push($(data).find('item'));
			}).always(countDown);
		});

		function extractData() {
			results = _combineLists(results, limit || 10);
			callback(results);
		}
	}

	// Returns a string that can be inserted as HTML
	var createRelatedItems = function(results, itemClass) {
		var relatedString = '';

		function wrapHeadline(link, title) { return  '<a href="' + link + '">' + title + '</a>'; }
		function wrapBody(description) { return '<p>' + description + '</p>'; }
		function wrapItem(e, itemClass) {
			var headline = $(e).find('text').text();
			var url = $(e).find('url').text();
			var description = $(e).find('description').text();
			if (typeof itemClass !== "string") { var itemClass = 'related-item'; }
			return '<div class="' + itemClass + '">' + wrapHeadline(url, headline) + wrapBody(description) + '</div>';
		}

		results.forEach(function(e, i) {
			relatedString += wrapItem(e, itemClass);
		});

		return relatedString;
	}

	return {
		search: delegateQuery,
		processResults: processResults,
		createRelatedItems: createRelatedItems
	}

}();

(function() {

	var mw = mediawikiSearch;

	$.fn.insertMWResults = function(requests, limit, callback) {
		var $container = this;
		mw.processResults(requests, limit, function(results) {
			$container.html(mw.createRelatedItems(results));
			callback();
		});
	}

})();