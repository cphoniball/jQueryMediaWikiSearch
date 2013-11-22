var mediawikiSearch = function() {

	var _generateRequestURL = function(endpoint, term, limit, format) {
		return endpoint + '?action=opensearch&format=' + format  + '&search=' + term + '&limit=' + limit;
	}

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

	var makeOpenSearchRequest = function(endpoint, term, limit) {
		return $.ajax({
			url: endpoint,
			method: 'GET',
			dataType: 'jsonp',
			data: {
				action: 'opensearch',
				search: term,
				limit: limit || 10,
				format: 'json'
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
		openSearch: makeOpenSearchRequest,
		multiSearch: multiTermSearch,
		formURL: formURL,
		formURLs: formURLs,
		generateList: generateListMarkup,
		combineLists: combineLists,
		createAsyncCounter: createAsyncCounter
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
