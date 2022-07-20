
load ("ghlib.js")

if (arguments.length < 1) {
	printUsage ()
	quit ()
}

var fS = fC = fV = fP = fR = fUsage = fname = false
var repo, token, arg, s, sl, p
for (n = o = 0; n < arguments.length; n ++) {
	arg = arguments [n]; s = new java.lang.String (s)
	if (arg [0] == '-') {
		if (s.compareToIgnoreCase ("--help") == 0 ||
			s.compareToIgnoreCase ("-help") == 0)
		{	fUsage = true; break	}
		sl = arg.length
		for (p = 1; p < sl; p++)
		switch (arg [p]) {
		case 's': fS = true; break
		case 'f': if (arg [++p] == ':') p++
			if (p < sl) fname = arg.substr (p); else
				if (++n < arguments.length) fname = arguments [n]; else
					fUsage = true
			p = sl; break
		case 'c': fC = true; break
		case 'v': fV = true; break
		case 'p': fP = true; break
		case 'r': fR = true; break
		case 'h': case 'H': case '?': fUsage = true; p = sl; break
		default: print ("Warning: unknown option: '" + arg [p] + "'")
			fUsage = true
		}
		continue
	}
	switch (o++) {
	case 0: repo = arg; break
	case 1: token = arg; break
	default: print ("Warning: Redundant argument: '" + arg + "'")
		fUsage = true
	}
}
if (!fUsage && o != 2) {
	print ("Error: Required arguments are not set")
	fUsage = true
}
if (fUsage) {
	printUsage (); quit ()
}

function printUsage ()
{
	print ("Get GitHub traffic statistic for last 14 days (using REST API)")
	print ("  ghstat.js <user>/<repo> <token> [-cvpr] [-s] [-f <stat-file>]")
	print ("\t-cvpr\t- select requested stat info:")
	print ("\t\tc: clones; v: views; p: paths; r: referrers")
	print ("\t-s\t- use stat file")
	print ("\t-f <stat-file> - set stat file name")
}
if (!(fC || fV || fP || fR))
	fC = fV = true;
if (fname !== false) fS = true

r = checkRepoName (repo)
if (r !== true) {
	print ("Error: " + r)
	java.lang.System.exit (1)
}
if (token.length > maxTokenLength) {
	print ("Error: Token length is too big")
	java.lang.System.exit (1)
}
print (fS, fC, fV, fP, fR, fname, repo, token)
