<?php

define('MAX_JSON_STRING_LENGTH', 1024*1024);

$script_basename=basename($argv[0]);

$json_string = '';
while (!feof (STDIN)) {
	$string = fread (STDIN, 128 * 1024);
	if ($string === false) break;
	$json_string .= $string;
	if (strlen ($json_string) > MAX_JSON_STRING_LENGTH) {
		fwrite (STDERR, "$script_basename: error: input is too long, exceeds "
			. MAX_JSON_STRING_LENGTH / 1024 . " kbytes\n");
		exit (1);
	}
}
unset ($string);

$json_string = trim ($json_string);
if (strlen ($json_string) == 0) exit (0);
$json = json_decode ($json_string, true);
$jsonle = json_last_error ();

if ($jsonle != JSON_ERROR_NONE || $json === false) {
	fwrite (STDERR, "$script_basename: error: JSON decode error: " .
		json_error_string ($jsonle) . "\n");
	exit (1);
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

$type = -1;
if (count ($json) == 0) $type = 0;
elseif (array_key_exists ('views', $json)) $type = 1;
elseif (array_key_exists ('clones', $json)) $type = 2;
elseif (array_key_exists ('message', $json)) {
    echo "Message: ${json['message']}\n";
    if (array_key_exists ('documentation_url', $json))
	echo "Documentation URL: ${json['documentation_url']}\n";
    if (count ($json) > 2) echo $json_string, "\n";
    exit(2);
} else {
	$el = $json [0];
	if ($el !== null && $el !== false) {
		if (array_key_exists ('path', $el)) $type = 3;
		elseif (array_key_exists ('referrer', $el)) $type = 4;
	}
}
unset($json_string);

switch ($type) {
case 1:
	printf (" %3d views, %d uniques\n", $json ['count'], $json ['uniques']);
	foreach ($json ['views'] as $val) {
		echo '  ', substr ($val ['timestamp'], 0, 10), "\t";
		printf ("%5d\t%5d\n", $val ['count'], $val ['uniques']);
	}
	break;
case 2:
	printf (" %3d clones, %d uniques\n", $json ['count'], $json ['uniques']);
	foreach ($json ['clones'] as $val) {
		echo '  ', substr ($val ['timestamp'], 0, 10), "\t";
		printf ("%5d\t%5d\n", $val ['count'], $val ['uniques']);
	}
	break;
case 3:
	echo "Popular paths:\n";
	foreach ($json as $page) {
		printf ('%5d %5d  "', $page ['count'], $page ['uniques']);
		echo $page ['title'], "\"\n\t\t", $page ['path'], "\n";
	}
	break;
case 4:
	echo "Popular referrers:\n";
	foreach ($json as $ref) {
		printf ('%5d %5d  ', $ref ['count'], $ref ['uniques']);
		echo $ref ['referrer'], "\n";
	}
case 0:	break;
default: fwrite (STDERR, "$script_basename: error: unknown JSON format\n");
	exit (1);
}

?>