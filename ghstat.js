
load ("ghlib.js")

if (arguments.length < 2) {
	print_usage ()
	quit ()
}

var f_s = f_c = f_v = f_p = f_r = f_usage = fname = false
var repo, token, arg, s, sl, p
for (n = o = 0; n < arguments.length; n ++) {
	arg = arguments [n]; s = new java.lang.String (s)
	if (arg [0] == '-') {
		if (s.compareToIgnoreCase ("--help") == 0) {
			f_usage = true; break
		}
		sl = arg.length
		for (p = 1; p < sl; p++)
		switch (arg [p]) {
		case "s": f_s = true; break
		case "f": if (arg [++p] == ":") p++
			if (p < sl) fname = arg.substr (p); else
				if (++n < arguments.length) fname = arguments [n]; else
					f_usage = true
			p = sl; break
		case "c": f_c = true; break
		case "v": f_v = true; break
		case "p": f_p = true; break
		case "r": f_r = true; break
		case "h": case "?": f_usage = true; p = al; break
		default: print ("Warning: unknown option: '" + arg + "'")
			f_usage = true
		}
		continue
	}
	switch (o++) {
	case 0: repo = arg; break
	case 1: token = arg; break
	default: print ("Warning: Redundant argument: '" + arg + "'")
		f_usage = true
	}
}
if (!f_usage && o != 2) {
	print ("Error: Required arguments are not set")
	f_usage = true
}
if (f_usage) {
	print_usage (); quit ()
}

function print_usage ()
{
	print ("Get GitHub traffic statistic for last 14 days (using REST API)")
	print ("  ghstat.php <user>/<repo> <token> [-cvpr] [-s] [-f <stat-file>]")
	print ("\t-cvpr\t- select requested stat info:")
	print ("\t\tc: clones; v: views; p: paths; r: referrers")
	print ("\t-s\t- use stat file")
	print ("\t-f <stat-file> - set stat file name")
}
print (f_s, f_c, f_v, f_p, f_r, f_usage, fname, repo, token)
