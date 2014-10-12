package daatri;
import java.io.*;

import org.json.JSONArray;
import org.json.JSONObject;

public class Coordinates {
	public static void main(String[] args) throws Exception {
		FileWriter file = new FileWriter("C:\\hackathon\\location_coordinates.js");
		BufferedReader br = new BufferedReader(new FileReader("C:\\hackathon\\data.csv"));
		String record = null;
		StringBuilder address = new StringBuilder();
		int noOfDonors = 0;
		GeoLocation geoObject = new GeoLocation();
		while((record = br.readLine()) != null) {
			String [] recordSplit = record.split(",");
			int length = recordSplit.length;
			length = length - 4;
			address = new StringBuilder();
			for(int i=0; i<length; i++) {
				address.append(recordSplit[i]);
				address.append(",");
			}
			noOfDonors = Integer.parseInt(recordSplit[recordSplit.length-1]);
			String add = address.toString();
			String addres = add.replaceAll("[^a-zA-Z0-9,]","");

			try 
			{
				geoObject.jsonLocationFileCreate(addres,noOfDonors);
			}
			catch(Exception e) {
				System.out.println(e);
			}
		}	
	
		if(geoObject.unknownAddress.size() != 0) {
			for(int i=0; i<geoObject.unknownAddress.size(); i++) {
				String splitAddress[] = geoObject.unknownAddress.get(i).split(",");
				geoObject.jsonLocationFileCreate(splitAddress[0]+","+splitAddress[1]+","+splitAddress[2],noOfDonors);
			}
		}
		 try {
			 
			 	file.write("var data = ");
	            file.write(geoObject.locationList.toString());
	            System.out.println(geoObject.locationList.toString());
	 
        } catch (IOException e) {
            e.printStackTrace();
 
        } finally {
            file.flush();
            file.close();
        }
	}

}
