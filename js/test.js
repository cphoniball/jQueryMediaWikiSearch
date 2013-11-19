test('mediawikiSearch.search', function() {
	function testSearchResponseHeader(actual, expected, host) {
		deepEqual(mediawikiSearch.search(host, 'example').getResponseHeader(), '200');
	}

	testSearchResponseHeader();

});