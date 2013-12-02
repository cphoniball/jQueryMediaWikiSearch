<?php

// Only going to be used to get data in XML format
// Will be called via ajax
function mwapi_make_opensearch_request() {
	// create curl session
	$r = curl_init();
	// set curl options with curl_setopt
	curl_setopt($r, CURLOPT_URL, $_POST['url']);
	curl_setopt($r, CURLOPT_RETURNTRANSFER, TRUE);
	curl_setopt($r, CURLOPT_USERAGENT, 'http://localhost:8888/mwapisearch/');

	// execute curl session
	$response = curl_exec($r);

	if (!$response) { // request failed, echo error and die
		echo 'error';
	}	else {
		echo $response;
	}

	//close curl session
	curl_close($r);
}

if (isset($_POST['action']) && $_POST['action'] == 'opensearch') {
	mwapi_make_opensearch_request();
}