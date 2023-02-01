<?php

if (!defined ('MAX_REQ_LEN')) define ('MAX_REQ_LEN', 65536);
if (!defined ('MAX_REPO_NAME_LEN')) define ('MAX_REPO_NAME_LEN', 256);

function gh_http_request ($req, $token, &$err)
{
	global $response_header;
	$opts = array ('http' => array (
		'header' => "Accept: application/vnd.github+json\r\n" .
			"Authorization: token $token\r\n"
	));
	$context = stream_context_create ($opts);
	$result = file_get_contents (GH_API_URL . $req, false, $context, 0, MAX_REQ_LEN);
	$response_header = $http_response_header;
	if ($result === false) {
		$err = 'HTTPS request failed';
		return false;
	}
	$json = json_decode ($result, true);
	$jsonle = json_last_error();
	if ($json === null && $jsonle != JSON_ERROR_NONE) {
		$err = 'JSON decode error: ' . json_error_string ($jsonle);
		return false;
	}
	return $json;
}

function gh_request ($req) {
	global $token;
	$res = gh_http_request ($req, $token, $err);
	if ($res === false) {
		echo "\nError: $err\n"; exit (1);
	}
	$r = get_http_response_code ($http_rcode);
	if ($r !== '200') {
		echo "\nError: Bad HTTPS response code: $http_rcode\n";
		if ($r == '403') echo "Probably token is incorrect\n";
		exit (1);
	}
	return $res;
}

function check_repo_name ($name)
{
	$l = strlen ($name);
	if ($l > MAX_REPO_NAME_LEN)
		return 'Repo name is too long (' . 
		$l . ' > ' . MAX_REPO_NAME_LEN . ')';
	for ($i = 0; $i < $l; $i++) {
		$c = $name [$i];
		if (!($c >= 'a' && $c <= 'z' || $c >= 'A' && $c <= 'Z' || $c >= '0' && $c <= '9'
			|| $c == '-' || $c == '_' || $c == '/')) break;
	}
	if ($i < $l) return 'Repo name contains illegal characters (A-Z 0-9 -_ are valid)';
	$p = strpos ($name, '/');
	if ($p === false || strpos ($name, '/', $p+1) !== false)
		return "Repo name must be in the form 'user/repo' (separated by slash)";
	return true;
}

function get_http_response_code (&$http_rcode)
{
	global $response_header;
	$s = $response_header [0];
	$p = strcspn ($s, " \t");
	if ($p === false) return false;
	$p += strspn ($s, " \t", $p);
	$l = strspn ($s, '0123456789', $p);
	if ($l === false) return false;
	$http_rcode = substr ($s, $p);
	return substr ($s, $p, $l);
}

function json_error_string ($err)
{
	$table = array (
		JSON_ERROR_NONE => 'JSON_ERROR_NONE',
		JSON_ERROR_DEPTH => 'JSON_ERROR_DEPTH',
		JSON_ERROR_STATE_MISMATCH => 'JSON_ERROR_STATE_MISMATCH',
		JSON_ERROR_CTRL_CHAR => 'JSON_ERROR_CTRL_CHAR',
		JSON_ERROR_SYNTAX => 'JSON_ERROR_SYNTAX',
		JSON_ERROR_UTF8 => 'JSON_ERROR_UTF8'
	);
	if (!array_key_exists ($err, $table))
		return $err;
	return $table [$err];
}

?>