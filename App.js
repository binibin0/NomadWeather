import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { useState, useEffect } from "react";

const WEATHER_API_KEY = "bcc473961544dd2933b7c5c0a23b210e";
export default function App() {
  function UnixToTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${month} / ${day}`;
  }

  const [location, setLocation] = useState("Loading...");
  const [ok, setOk] = useState(true);
  const [days, setDays] = useState([]);
  const ask = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });

    const reverseGeoLocation = await Location.reverseGeocodeAsync(
      //
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    const { city, district } = reverseGeoLocation[0];

    setLocation(`${city} ${district}`);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&appid=${WEATHER_API_KEY}&units=metric`
    );
    const json = await response.json();
    setDays(json.daily);
    //console.log(days);
  };
  useEffect(() => {
    ask();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <View style={styles.locationBox}>
        <Text style={{ fontSize: 30, marginTop: 30 }}>Your location</Text>
        <Text style={styles.location}>{location}</Text>
      </View>
      <ScrollView //
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        horizontal
        contentContainerStyle={styles.infoBox}
      >
        {days.length === 0 ? (
          <View style={styles.detailBox}>
            <ActivityIndicator />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.detailBox}>
              <Text style={styles.date}>{UnixToTime(day.dt)}</Text>
              <Text style={styles.temperature}>{`${day.temp.eve.toFixed(1)}°C`}</Text>
              <Text style={styles.status}>{day.weather[0].main}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const { width: WINDOW_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  locationBox: {
    flex: 1,
    backgroundColor: "#808080",
    justifyContent: "center",
    alignItems: "center",
  },
  location: {
    fontSize: 50,
    marginTop: 15,
  },
  infoBox: {
    backgroundColor: "#696969",
    justifyContent: "center",
    alignItems: "center",
  },
  detailBox: {
    width: WINDOW_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  date: {
    fontSize: 32,
    marginBottom: 20,
  },
  temperature: {
    fontSize: 120,
  },
  status: {
    fontSize: 45,
    marginTop: -10,
  },
});
