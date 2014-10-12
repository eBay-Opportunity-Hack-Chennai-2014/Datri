package daatri;
import java.io.*;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.net.URLEncoder;
import java.util.ArrayList;
/**
 * This class is the same as the ApacheHttpRestClient2 class, but with
 * fewer try/catch clauses, and fewer comments.
*/
public class GeoLocation {
	int addressCount = 0;
	StringBuilder geoLocationResponse = new StringBuilder();
	ArrayList <String>testResponse = new ArrayList<String>();
	ArrayList <String> unknownAddress = new ArrayList<String>();
		JSONArray locationList = new JSONArray();
	void jsonLocationFileCreate(String address, int noOfDonors) throws JSONException
	{
		JSONObject obj = new JSONObject();

		String geoLocationResponse = getLocationCoordinates(address);
		testResponse.add(geoLocationResponse);
	    obj = new JSONObject(geoLocationResponse);
	    Double lattitude = 0.0;
	    Double longitude = 0.0;
		try
		{
			lattitude = (Double)obj.getJSONArray("results").getJSONObject(0).getJSONObject("geometry").getJSONObject("location").get("lat");
			longitude = (Double)obj.getJSONArray("results").getJSONObject(0).getJSONObject("geometry").getJSONObject("location").get("lng");
			JSONObject locationObject = new JSONObject();
			locationObject.put("lat", lattitude);
			locationObject.put("lon", longitude);
			locationObject.put("donors", noOfDonors);
			locationList.put(locationObject);	
			System.out.println(locationObject);
		}
		catch(JSONException e) {
			unknownAddress.add(address);
//	    	System.out.println(unknownAddress);
		}
		
	}
	String getLocationCoordinates(String address) {
		geoLocationResponse = new StringBuilder();
		StringBuilder geoLocationURL = new StringBuilder("https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCVPEXr0IPZqFrcIRzUsBxjDJkCbOvHyXc&address=");
		geoLocationURL.append(address); 
		HttpClient httpClient = new DefaultHttpClient();
	    try {

	      HttpGet httpGetRequest = new HttpGet(geoLocationURL.toString());
	      HttpResponse httpResponse = httpClient.execute(httpGetRequest);
	 
	      HttpEntity entity = httpResponse.getEntity();
	 
	      byte[] buffer = new byte[1024];
	      if (entity != null) {
	        InputStream inputStream = entity.getContent();
	        try {
	          int bytesRead = 0;
	          BufferedInputStream bis = new BufferedInputStream(inputStream);
	          
	          while ((bytesRead = bis.read(buffer)) != -1) {
	            String chunk = new String(buffer, 0, bytesRead);
	            geoLocationResponse.append(chunk);
	          }
	        } catch (Exception e) {
	          e.printStackTrace();
	        } finally {
	          try { inputStream.close(); } catch (Exception ignore) {}
	        }
	      }
	    } 
	    catch (Exception e) {
	      e.printStackTrace();
	    } 

	    finally {
	      httpClient.getConnectionManager().shutdown();
	    }
	    return geoLocationResponse.toString();
	 }
	
	}
