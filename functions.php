<?php

// Only going to be used to get data in XML format
// Will be called via ajax
function mwapi_make_opensearch_request() {
	$r = new HttpRequest( $_POST['endpoint'], HttpRequest::METH_GET);
	$r->addQueryData(array(
		'action' => 'opensearch',
		'search' => $_POST['search'],
		'limit' => $_POST['limit'],
		'format' => 'xml'
	));

	$r->send();
	if ($r->getResponseCode() == 200) {
		echo $r->getResponseBody();
	} else {
		echo 'Error, response code: ' . $r->getResponseCode();
	}
}

if (isset($_POST['action']) && $_POST['action'] == 'opensearch') {
	mwapi_make_opensearch_request();
}