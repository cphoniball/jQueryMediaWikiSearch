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
	var countDown = createAsyncCounter(7);

	// Test that it returns a 200 status code for various endpoints
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
			console.log(data.query);
			ok(data.query.search.length <= limit, 'Response length for term ' + term + ' under or equal to ' + limit +'.');
		}).always(countDown);
	}

	testSearchResponseLimit(sbEndpoint, 'small business', 10);
	testSearchResponseLimit(sbEndpoint, 'small business', 1);
	testSearchResponseLimit(sbEndpoint, 'random', 5);

	// testOpenSearchRequest
	function testOSResponseStatus(endpoint) {
		mediawikiSearch.openSearch(endpoint, 'small business', 10).done(function(data, status, xhr) {
			deepEqual(xhr.status, 200);
		}).always(countDown);
	}

	testOSResponseStatus(sbEndpoint);
	testOSResponseStatus(wpEndpoint);
});

test('mediawikiSearch.formURLs', function() {

	function testFormURL(title, expected) {
		deepEqual(mediawikiSearch.formURL('http://smallbusiness.com/wiki/', title), expected, title + ' formatted correctly');
	}

	var titles = ['Small Business administration', 'sba something or another', 'justone', '', '1234 and 5678'];
	var formatted = ['http://smallbusiness.com/wiki/Small_Business_Administration', 'http://smallbusiness.com/wiki/Sba_Something_Or_Another', 'http://smallbusiness.com/wiki/Justone', 'http://smallbusiness.com/wiki/', 'http://smallbusiness.com/wiki/1234_And_5678'];

	testFormURL(titles[0], 'http://smallbusiness.com/wiki/Small_Business_Administration');
	testFormURL(titles[1], 'http://smallbusiness.com/wiki/Sba_Something_Or_Another');
	testFormURL(titles[2], 'http://smallbusiness.com/wiki/Justone');
	testFormURL(titles[3], 'http://smallbusiness.com/wiki/');
	testFormURL(titles[4], 'http://smallbusiness.com/wiki/1234_And_5678');

	deepEqual(mediawikiSearch.formURLs('http://smallbusiness.com/wiki/', titles), formatted, 'FormURLs formatting correctly.');
});

test('mediawikiSearch.combineLists', function() {

	function testCombineLists(lists, expected) {
		deepEqual(mediawikiSearch.combineLists(lists, 4), expected, 'Combine lists works for ' + lists);
	}

	var list1 = [
		['something', 'else', 'here'],
		['and', 'this', 'new'],
		['testing', 'the', 'function']
	];
	var list1combined = ['something', 'and', 'testing', 'else'];

	var list2 = [
		['this', 'is', 'going', 'to', 'have', 'duplicates'],
		['duplicates', 'what', 'are', 'those'],
		['something', 'duplicates', 'are'],
		['here', 'is', 'a', 'final', 'list']
	];
	var list2combined = ['duplicates', 'are', 'is', 'this']

	testCombineLists(list1, list1combined);
	testCombineLists(list2, list2combined);
});