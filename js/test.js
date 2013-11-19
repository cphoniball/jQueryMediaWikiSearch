// counts down to start() for async tests
// from so http://stackoverflow.com/questions/9431597/unit-testing-ajax-requests-with-qunit
function createAsyncCounter(count) {
	count = count || 1;
	return function() { --count || start(); };
}


asyncTest('mediawikiSearch.search', function() {
	var countDown = createAsyncCounter(2);

	function testSearchResponseHeader(endpoint) {
		mediawikiSearch.search(endpoint, 'example').done(function(data, status, xhr) {
			deepEqual(xhr.status, 200);
		}).always(countDown);
	}

	testSearchResponseHeader('http://en.wikipedia.org/w/api.php');
	testSearchResponseHeader('http://smallbusiness.com/w/api.php');
});