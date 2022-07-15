
import java.net.*;
import java.nio.file.*;
import java.nio.charset.Charset;

class ghreq {
	public static void main (String[] args) {
		System.out.println ("GitHub stat request example");
		try {
			String token = new String (Files.readAllBytes (Paths.get ("ghtoken.txt")), Charset.forName ("US-ASCII"));
			HttpURLConnection conn = (HttpURLConnection)
				new URL("https://api.github.com/repos/usr38259/gh-stat/traffic/clones").openConnection();
			conn.setRequestProperty ("Accept", "application/vnd.github+json");
			conn.setRequestProperty ("Authorization", "token " + token);
			System.out.println (conn.getResponseCode());
			System.out.println (conn.getResponseMessage());
		} catch (Exception e) {
			e.printStackTrace ();
		}
	}
}
