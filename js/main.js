$(document).ready(function() {

	//$('.searchResults').appendMediawikiResultsList('http://smallbusiness.com/w/api.php', 'tax', 10, 'http://smallbusiness.com/wiki');

	$('.multiSearchResults').appendMultiTermResults('http://smallbusiness.com/w/api.php', ['tax', 'small business', 'arizona'], 10, 'http://smallbusiness.com/wiki/');

});