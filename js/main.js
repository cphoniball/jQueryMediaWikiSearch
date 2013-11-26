$(document).ready(function() {

	//$('.searchResults').appendMediawikiResultsList('http://smallbusiness.com/w/api.php', 'tax', 10, 'http://smallbusiness.com/wiki');

	//$('.multiSearchResults').appendMultiTermResults('http://smallbusiness.com/w/api.php', ['tax', 'small business', 'arizona'], 10, 'http://smallbusiness.com/wiki/');

	var mw = mediawikiSearch;

	function validateSearchForm() {
		var limit = $('#limit').val();
		var terms = $('#terms').val();

		if (limit < 1 || limit > 20) {
			$('.alert-danger').removeClass('hidden').text('Oops, looks like your limit isn\'t between 1 and 20. Change it and try again.');
			return false;
		} else {
			$('.alert-danger').addClass('hidden');
			return true;
		}
	}


	$('#api-search-submit').click(function(event) {
		event.preventDefault();
		$('.results-list').html('');
		if (validateSearchForm()) {
			$('.loader').removeClass('hidden');
			$('.results-list').appendMultiTermResults(
				$('#wiki option:selected').data('endpoint'),
				$('#terms').val().split(','),
				$('#limit').val(),
				$('#wiki option:selected').data('baseurl'),
				function() {
					$('.loader').addClass('hidden');
					$('.results h1').removeClass('hidden');
				}
			);
		}
	});

	// mediawikiSearch.openSearch('http://en.wikipedia.org/w/api.php', 'small business', 10, 'xml').always(function(data, status, xhr) {
	// 	console.log('The status is ' + status);
	// 	console.log("The fucking call finished.");
	// 	console.log(data);
	// 	console.log(xhr);
	// 	console.log(xhr.responseXML);
	// });

	mw.delegateQuery('http://en.wikipedia.org/w/api.php', 'small business', 10);


});