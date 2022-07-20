
var maxRepoNameLen, maxTokenLen, GHApiURL

if (typeof maxRepoNameLen == "undefined") maxRepoNameLength = 256
if (typeof maxTokenLen == "undefined") maxTokenLength = 256
if (typeof GHApiURL == "undefined") GHApiURL = "https://api.github.com/repos/"

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
