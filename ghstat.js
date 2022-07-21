
var maxRepoNameLen, maxTokenLen, GHApiURL

if (typeof maxRepoNameLen == "undefined") maxRepoNameLength = 256
if (typeof maxTokenLen == "undefined") maxTokenLength = 256
if (typeof GHApiURL == "undefined") GHApiURL = "https://api.github.com/repos/"
if (typeof args == "undefined") args = arguments

function checkRepoName (name)
{
	var l = name.length, i, c
	if (l > maxRepoNameLength)
		return "Repo name is too long"
	for (i = 0; i < l; i++) {
		c = name [i]
		if (!(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9'
			|| c == '-' || c == '_' || c == '/')) break
	}
	if (i < l) return "Repo name contains illegal characters (A-Z 0-9 -_ are valid)"
	var p = name.indexOf ('/')
	if (p == -1 || name.lastIndexOf ('/') != p)
		return "Repo name must be in the form 'user/repo' (separated by a slash)"
	return true
}

function GHRequest (req, arr)
{
	var lst = new java.util.Vector ()
	lst.add ("curl"); lst.add ("-s"); lst.add ("-D"); lst.add ("-")
	lst.add ("-H"); lst.add ('"Accept: application/vnd.github+json"')
	lst.add ("-H"); lst.add ('"Authorization: token ' + token + '"')
	lst.add (GHApiURL + repo + req)
	var pbld = new java.lang.ProcessBuilder (lst)
	var benv = pbld.environment ()
	if (!benv.containsKey ("LD_LIBRARY_PATH"))
		benv.put ("LD_LIBRARY_PATH", "/data/data/com.termux/files/usr/lib")
	if (!benv.containsKey ("LD_PRELOAD"))
		benv.put ("LD_PRELOAD", "/data/data/com.termux/files/usr/lib/libtermux-exec.so")
	var p = pbld.start ()
	p.waitFor ()
	if (p.exitValue () > 0) {
		print ("\nError: Bad curl exit value:", p.exitValue ())
		java.lang.System.exit (1)
	}
	var brd = new java.io.BufferedReader (new java.io.InputStreamReader (p.getInputStream ()))
	var l = brd.readLine ()
	if (l == null) {
		print ("\nError: Bad HTTPS response")
		java.lang.System.exit (1)
	}
	var i = l.indexOf (' ')
	if (i == -1) {
		print ("\nError: Bad HTTPS response")
		java.lang.System.exit (1)
	}
	while (i < l.length () && l.codePointAt (i) == 0x20) i++
	var j = i
	while (j < l.length () && l.codePointAt (j) >= 0x30 && l.codePointAt (j) <= 0x39) j++
	var rc = parseInt (l.substring (i, j))
	while (j < l.length () && l.codePointAt (j) == 0x20) j++
	if (rc != 200) {
		print ("\nError: Bad HTTPS response code:", rc, l.substring (j))
		if (rc == 403) print ("Probably token is incorrect")
		java.lang.System.exit (1)
	}
	while ((l = brd.readLine ()) != null)
		if (l.length () == 0) break
	var json = new java.lang.String ()
	while ((l = brd.readLine ()) != null) json += l + "\n"
	if (arr) return new org.json.JSONArray (json)
	return new org.json.JSONObject (json)
}

function printUsage ()
{
	print ("Get GitHub traffic statistic for last 14 days (using REST API)")
	print ("  ghstat.js <user>/<repo> <token> [-cvpr]")
	print ("\t-cvpr\t- select requested stat info:")
	print ("\t\tc: clones; v: views; p: paths; r: referrers")
}

if (args.length < 1) {
	printUsage ()
	quit ()
}

var fS = fC = fV = fP = fR = fUsage = fname = false
var repo, token, arg, s, sl, p
for (n = o = 0; n < args.length; n ++) {
	arg = args [n]; s = new java.lang.String (s)
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
				if (++n < args.length) fname = args [n]; else
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
var f = true, jo, ja
function prnok () {
if (f) { print ("Ok"); f = false }
}
function prnList (type) {
java.lang.System.out.printf ("%3d %s, %d uniques\n",
	java.lang.Integer.valueOf (jo.optInt ('count')), type,
	java.lang.Integer.valueOf (jo.optInt ('uniques')))
ja = jo.optJSONArray (type)
if (ja != null) {
	for (var i = 0; (jo = ja.optJSONObject (i)) != null; i++)
		java.lang.System.out.printf ("  %s\t%5d\t%5d\n",
			jo.optString ('timestamp').substring (0, 10),
			java.lang.Integer.valueOf (jo.optInt ('count')),
			java.lang.Integer.valueOf (jo.optInt ('uniques')))
}
}
function doRequest () {
java.lang.System.out.print ("\nRequesting ")
java.lang.System.out.print (repo)
java.lang.System.out.print ("... ")
if (fC) {
jo = GHRequest ("/traffic/clones", false)
prnok ()
prnList ('clones')
}
if (fP) {
ja = GHRequest ("/traffic/popular/paths", true)
prnok ()
print ("Popular paths:")
for (var i = 0; (jo = ja.optJSONObject (i)) != null; i++)
	java.lang.System.out.printf ('%5d %5d  "%s"\n\t\t%s\n',
		java.lang.Integer.valueOf (jo.optInt ('count')),
		java.lang.Integer.valueOf (jo.optInt ('uniques')),
		jo.optString ('title'), jo.optString ('path'))
}
if (fR) {
ja = GHRequest ("/traffic/popular/referrers", true)
prnok ()
print ("Popular referrers:")
for (var i = 0; (jo = ja.optJSONObject (i)) != null; i++)
	java.lang.System.out.printf ('%5d %5d  %s\n',
		java.lang.Integer.valueOf (jo.optInt ('count')),
		java.lang.Integer.valueOf (jo.optInt ('uniques')),
		jo.optString ('referrer'))
}
if (fV) {
jo = GHRequest ("/traffic/views", false)
prnok ()
prnList ('views')
} }

doRequest (); quit ()
