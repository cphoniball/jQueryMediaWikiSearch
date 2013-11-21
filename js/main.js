$(document).ready(function() {

	mediawikiSearch.openSearch('http://smallbusiness.com/w/api.php', 'small business', 4, 'json')
	.done(function(data) {
		$('.os-jsonfm').html(JSON.stringify(data, undefined, 2));
	});

	mediawikiSearch.openSearch('http://smallbusiness.com/w/api.php', 'small business', 4, 'xmlfm')
	.done(function(data) {
		// var xmlText = new XMLSerializer().serializeToString(data);
		// var xmlTextNode = document.createTextNode(xmlText);
		var $xml = $.parseXML(data);

		$('.os-xmlfm').html($xml);
	});

});

