var mediawikiSearch = function() {


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

	return {
		search: makeSearchRequest
	}

}();