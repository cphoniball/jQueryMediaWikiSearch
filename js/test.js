var sbEndpoint = 'http://smallbusiness.com/w/api.php';
var wpEndpoint = 'http://en.wikipedia.org/w/api.php';

// counts down to start() for async tests
// from so http://stackoverflow.com/questions/9431597/unit-testing-ajax-requests-with-qunit
function createAsyncCounter(count) {
	count = count || 1;
	return function() { --count || start(); };
}

// Test that search function
asyncTest('mediawikiSearch.search', function() {
	var countDown = createAsyncCounter(5);

	// Test that it returns a 200 status code
	function testSearchResponseHeader(endpoint) {
		mediawikiSearch.search(endpoint, 'small business').done(function(data, status, xhr) {
			deepEqual(xhr.status, 200);
		}).always(countDown);
	}

	testSearchResponseHeader(wpEndpoint);
	testSearchResponseHeader(sbEndpoint);

	// Test that it returns at most 'limit' responses
	function testSearchResponseLimit(endpoint, term, limit) {
		mediawikiSearch.search(endpoint, term, limit).done(function(data, status, xhr) {
			ok(data.query.search.length <= limit, 'Response length for term ' + term + ' under or equal to ' + limit +'.');
		}).always(countDown);
	}

	testSearchResponseLimit(sbEndpoint, 'small business', 10);
	testSearchResponseLimit(sbEndpoint, 'small business', 1);
	testSearchResponseLimit(sbEndpoint, 'random', 5);
});

