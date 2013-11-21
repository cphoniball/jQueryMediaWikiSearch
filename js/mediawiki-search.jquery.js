var mediawikiSearch = function() {

	var _generateRequestURL = function(endpoint, term, limit, format) {
		return endpoint + '?action=opensearch&format=' + format  + '&search=' + term + '&limit=' + limit;
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
		formURL: formURL,
		formURLs: formURLs,
		generateList: generateListMarkup
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
}