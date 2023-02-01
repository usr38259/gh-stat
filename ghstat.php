<?php

define ('MAX_REPO_NAME_LEN', 256);
define ('YEAR_COUNTOFF', 2022);
define ('MAX_TOKEN_LEN', 4096);
define ('MAX_REQ_LEN', 65536);
define ('GH_API_URL', 'https://api.github.com/repos/');

require_once 'ghlib.php';

$f_s = $f_c = $f_v = $f_p = $f_r = $f_usage = false;
$fname = false;

if ($argc <= 1) {
	print_usage ();
	exit (0);
}

for ($n = 1, $o = 0; $n < $argc; $n ++) {
	if ($argv [$n][0] == '-') {
		if (strcasecmp ($argv [$n], '--help') == 0) {
			$f_usage = true; break;
		}
		$al = strlen ($argv [$n]);
		for ($p = 1; $p < $al; $p ++)
		switch ($argv [$n][$p]) {
		case 's': $f_s = true; break;
		case 'f': if ($argv [$n][++$p] == ':') $p++;
			if ($p < $al) $fname = substr ($argv [$n], $p);
			else if (++$n < $argc) $fname = $argv [$n];
				else $f_usage = true;
			$p = $al; break;
		case 'c'; $f_c = true; break;
		case 'v': $f_v = true; break;
		case 'p': $f_p = true; break;
		case 'r': $f_r = true; break;
		case 'h': case '?': $f_usage = true; $p = $al; break;
		default: echo "Warning: unknown option: '{$argv [$n][$p]}'\n";
			$f_usage = true;
		}
		continue;
	}
	switch ($o++) {
	case 0: $repo = $argv [$n]; break;
	case 1: $token = $argv [$n]; break;
	default: echo "Warning: Redundant argument: '{$argv[$n]}'\n";
		$f_usage = true;
	}
}
if (!$f_usage && $o != 2) {
	echo "Error: Required arguments are not set\n";
	$f_usage = true;
}
unset ($n, $al, $p, $o);
if ($f_usage) {
	print_usage (); exit (0);
}

if (!($f_c || $f_v || $f_p || $f_r))
	$f_c = $f_v = true;
if ($fname !== false) $f_s = true;

$r = check_repo_name ($repo);
if ($r !== true) {
	echo "Error: $r\n"; exit (1);
}
if (strlen ($token) > MAX_TOKEN_LEN) {
	echo "Error: Token length is too big\n"; exit (1);
}

function print_usage ()
{
	echo "Get GitHub traffic statistic for last 14 days (using REST API)\n";
	echo "  ghstat.php <user>/<repo> <token> [-cvpr] [-s] [-f <stat-file>]\n";
	echo "\t-cvpr\t- select requested stat info:\n";
	echo "\t\tc: clones; v: views; p: paths; r: referrers\n";
	echo "\t-s\t- use stat file\n";
	echo "\t-f <stat-file> - set stat file name\n";
}

echo "Requesting $repo...";
$rc = $rp = $rr = $rv = false;
if ($f_c) $rc = gh_request ("$repo/traffic/clones");
if ($f_p) $rp = gh_request ("$repo/traffic/popular/paths");
if ($f_r) $rr = gh_request ("$repo/traffic/popular/referrers");
if ($f_v) $rv = gh_request ("$repo/traffic/views");
echo " Ok\n";

if ($rc) {
	printf ("%3d clones, %d uniques\n", $rc ['count'], $rc ['uniques']);
	foreach ($rc ['clones'] as $val) {
		echo '  ', substr ($val ['timestamp'], 0, 10), "\t";
		printf ("%5d\t%5d\n", $val ['count'], $val ['uniques']);
	}
}
if ($rp) {
	echo "Popular paths:\n";
	foreach ($rp as $page) {
		printf ('%5d %5d  "', $page ['count'], $page ['uniques']);
		echo $page ['title'], "\"\n\t\t", $page ['path'], "\n";
	}
}
if ($rr) {
	echo "Popular referrers:\n";
	foreach ($rr as $ref) {
		printf ('%5d %5d  ', $ref ['count'], $ref ['uniques']);
		echo $ref ['referrer'], "\n";
	}
}
if ($rv) {
	printf ("%3d views, %d uniques\n", $rc ['count'], $rc ['uniques']);
	foreach ($rv ['views'] as $val) {
		echo '  ', substr ($val ['timestamp'], 0, 10), "\t";
		printf ("%5d\t%5d\n", $val ['count'], $val ['uniques']);
	}
}

?>