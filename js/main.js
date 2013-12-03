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
			var requests = mw.search(
				'http://localhost:8888/mwapisearch/functions.php', // internal function URL
				$('#wiki option:selected').data('endpoint'),
				$('#terms').val().split(', '),
				$('#limit').val()
			);
			$('.results-list').insertMWResults(requests, $('#limit').val(), function() {
				$('.loader').addClass('hidden');
				$('.results h1').removeClass('hidden');
			});
		}
	});

});