<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mediawiki API Search Tests</title>
  <link rel="stylesheet" href="packages/bootstrap/dist/css/bootstrap.css">
  <link rel="stylesheet" href="packages/font-awesome/css/font-awesome.css">

  <script src="packages/bootstrap/dist/bootstrap.js"></script>
  <script src="packages/jquery/jquery.js"></script>
  <script src="js/mediawiki-search.jquery.js"></script>
  <script src="js/main.js"></script>
</head>
<body>

	<div id="main" class="row">
		<div class="form-container col-sm-10 col-sm-offset-1">

			<h1>Mediawiki Search API example page</h1>

			<form action="#" role="form" class="form-horizontal" id="mw-search-example">
				<div class="form-group">
					<label for="endpoint" class="col-sm-2 control-label">Wiki to search</label>
					<div class="col-sm-10">
						<select class="form-control" id="wiki" name="wiki">
							<option value="SmallBusiness.com" data-endpoint="http://smallbusiness.com/w/api.php" data-baseurl="http://smallbusiness.com/wiki/">SmallBusiness.com</option>
							<option value="Wikipedia" data-endpoint="http://en.wikipedia.org/w/api.php" data-baseurl="http://en.wikipedia.org/wiki/">Wikipedia</option>
						</select>
					</div>
				</div>

				<div class="form-group">
					<label for="terms" class="col-sm-2 control-label">Search terms</label>
					<div class="col-sm-10">
						<input type="text" class="form-control" id="terms" name="terms" placeholder="Terms (separate each term with a comma)">
					</div>
				</div>

				<div class="form-group">
					<label for="limit" class="col-sm-2 control-label">Limit</label>
					<div class="col-sm-10">
						<input type="text" class="form-control" id="limit" name="limit" placeholder="How many results to receive, keep it somewhere between 1 and 20">
					</div>
				</div>

				<div class="form-group">
					<div class="col-sm-offset-2 col-sm-10">
						<button type="submit" id="api-search-submit" class="btn btn-default">Submit</button>
					</div>
				</div>
			</form>

			<div class="alert alert-danger hidden"></div>

			<div class="results">
				<h1 class="hidden">Results</h1>
				<p class="hidden loader">Loading results... <i class="fa fa-spinner fa-spin"></i></p>
				<ol class="results-list"><!-- filled via ajax on form submit --></ol>
			</div>

		</div><!-- end .form-container -->
	</div><!-- end #main.row -->

</body>
</html>