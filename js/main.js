$(document).ready(function() {

	// mediawikiSearch.openSearch('http://smallbusiness.com/w/api.php', 'tax', 10).done(function(data, status, xhr) {
	// 	var urls = mediawikiSearch.formURLs('http://smallbusiness.com/wiki/', data[1]);
	// 	urls = urls.map(function(e) {
	// 		return '<li>' + e + '</li>';
	// 	});
	// 	$('ul.searchResults').html(urls);
	// });

	$('.searchResults').appendMediawikiResultsList('http://smallbusiness.com/w/api.php', 'tax', 10, 'http://smallbusiness.com/wiki/');

});