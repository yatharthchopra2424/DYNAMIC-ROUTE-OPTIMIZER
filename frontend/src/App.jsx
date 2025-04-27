import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import PropTypes from "prop-types";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./Login";

const MapComponent = ({ routeData, index, travelMode }) => {
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!window.google || !routeData) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 28.6139, lng: 77.209 },
      zoom: 7,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      scaleControl: true,
      rotateControl: true,
      gestureHandling: "greedy",
      clickableIcons: true,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    });

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true, 
      polylineOptions: {
        strokeColor: index === null ? "#FF0000" : "#0000FF",
        strokeWeight: 5,
        strokeOpacity: 0.9,
      },
      preserveViewport: false,
      draggable: true, 
      panel: null,
    });
    directionsRendererRef.current = directionsRenderer;

    const steps = routeData.steps || [];
    const maxWaypoints = 23;
    const waypoints = steps.length > 2
      ? steps.slice(1, Math.min(steps.length - 1, maxWaypoints + 1)).map(step => ({
          location: {
            lat: step.end_location.lat,
            lng: step.end_location.lng,
          },
          stopover: true,
        }))
      : [];

    directionsService.route(
      {
        origin: {
          lat: steps[0]?.start_location.lat,
          lng: steps[0]?.start_location.lng,
        },
        destination: {
          lat: steps[steps.length - 1]?.end_location.lat,
          lng: steps[steps.length - 1]?.end_location.lng,
        },
        waypoints,
        travelMode: travelMode || window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        optimizeWaypoints: true,
        avoidTolls: false,
        avoidFerries: false,
        avoidHighways: false,
        region: "IN",
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);

          const routeLegs = result.routes[0].legs;
          const startMarker = new window.google.maps.Marker({
            position: routeLegs[0].start_location,
            map,
            label: {
              text: "A",
              color: "#fff",
              fontWeight: "bold"
            },
            title: "Start",
            icon: {
              path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#fff"
            }
          });
          markersRef.current.push(startMarker);

          for (let i = 0; i < routeLegs.length - 1; i++) {
            const marker = new window.google.maps.Marker({
              position: routeLegs[i].end_location,
              map,
              label: {
                text: String.fromCharCode(66 + i), // B, C, D...
                color: "#fff",
                fontWeight: "bold"
              },
              title: `Waypoint ${i + 1}`,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: "#34A853",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#fff"
              }
            });
            markersRef.current.push(marker);
          }

          const endMarker = new window.google.maps.Marker({
            position: routeLegs[routeLegs.length - 1].end_location,
            map,
            label: {
              text: String.fromCharCode(66 + routeLegs.length - 1), // Next letter after waypoints
              color: "#fff",
              fontWeight: "bold"
            },
            title: "End",
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: "#EA4335",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#fff"
            }
          });
          markersRef.current.push(endMarker);

          markersRef.current.forEach((marker, idx) => {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `<b>${marker.getTitle()}</b>`,
            });
            marker.addListener("click", () => {
              infoWindow.open(map, marker);
            });
          });

          const trafficLayer = new window.google.maps.TrafficLayer();
          trafficLayer.setMap(map);

          const transitLayer = new window.google.maps.TransitLayer();
          transitLayer.setMap(map);

          if (travelMode === "BICYCLING") {
            const bikeLayer = new window.google.maps.BicyclingLayer();
            bikeLayer.setMap(map);
          }
        }
      }
    );

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [routeData, index, travelMode]);

  return (
    <div
      ref={mapRef}
      style={{ height: "100%", width: "100%" }}
      className="rounded-md shadow-lg"
    />
  );
};

MapComponent.propTypes = {
  routeData: PropTypes.shape({
    distance: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
    polyline: PropTypes.string.isRequired,
    steps: PropTypes.array,
  }).isRequired,
  index: PropTypes.number,
  travelMode: PropTypes.string,
};

const RouteInfo = ({ routeData, emissions, weather, airQuality, start, end, index, packageWeight }) => (
  <div className="bg-white/30 p-4 rounded-md shadow-md mb-4 backdrop-blur">
    <h2 className="text-lg font-semibold text-gray-800 mb-2">
      {index === null ? "Best Route" : `Alternative Route ${index + 1}`} from {start} to {end}
    </h2>
    <div className="space-y-1 text-sm text-gray-600">
      <p><strong>Distance:</strong> {(routeData.distance / 1000).toFixed(2)} km</p>
      <p><strong>Duration:</strong> {(routeData.duration / 60).toFixed(2)} minutes</p>
      <p><strong>Emissions:</strong> {emissions.toFixed(2)} g CO2</p>
      <p>
        <strong>Weather:</strong> {weather.temperature.toFixed(2)}°C, Wind: {weather.wind_speed.toFixed(2)} km/h,
        Humidity: {weather.humidity}%
      </p>
      <p><strong>Air Quality Index:</strong> {airQuality}</p>
      <p><strong>Package Weight:</strong> {packageWeight} kg</p>
    </div>
  </div>
);

RouteInfo.propTypes = {
  routeData: PropTypes.shape({
    distance: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
    polyline: PropTypes.string.isRequired,
  }).isRequired,
  emissions: PropTypes.number.isRequired,
  weather: PropTypes.shape({
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    wind_speed: PropTypes.number.isRequired,
  }).isRequired,
  airQuality: PropTypes.number.isRequired,
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  index: PropTypes.number,
  packageWeight: PropTypes.number.isRequired,
};

const App = () => {
  const [start, setStart] = useState("");
  const [ends, setEnds] = useState([""]);
  const [vehicleType, setVehicleType] = useState("car");
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBestRoute, setShowBestRoute] = useState(true);
  const [packageWeight, setPackageWeight] = useState(0);
  const [user, setUser] = useState(null);
  const [travelMode, setTravelMode] = useState("DRIVING");

  const startInputRef = useRef(null);
  const endInputRefs = useRef([]);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let mode = "DRIVING";
    if (vehicleType === "bike") mode = "BICYCLING";
    else if (vehicleType === "public-transport") mode = "TRANSIT";
    else if (vehicleType === "flying") mode = "DRIVING";
    else if (vehicleType === "car" || vehicleType === "van" || vehicleType === "truck") mode = "DRIVING";
    setTravelMode(mode);
  }, [vehicleType]);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;

    if (startInputRef.current) {
      const autocompleteStart = new window.google.maps.places.Autocomplete(startInputRef.current, {
        types: ["geocode"],
        componentRestrictions: { country: "in" },
      });
      autocompleteStart.addListener("place_changed", () => {
        const place = autocompleteStart.getPlace();
        if (place.formatted_address) setStart(place.formatted_address);
        else if (place.name) setStart(place.name);
      });
    }

    endInputRefs.current.forEach((ref, idx) => {
      if (ref) {
        const autocompleteEnd = new window.google.maps.places.Autocomplete(ref, {
          types: ["geocode"],
          componentRestrictions: { country: "in" },
        });
        autocompleteEnd.addListener("place_changed", () => {
          const place = autocompleteEnd.getPlace();
          setEnds((prev) => {
            const updated = [...prev];
            updated[idx] = place.formatted_address || place.name || "";
            return updated;
          });
        });
      }
    });
  }, [user, ends.length]);

  const handleAddEnd = () => {
    setEnds([...ends, ""]);
  };

  const handleRemoveEnd = (idx) => {
    setEnds(ends.filter((_, i) => i !== idx));
    endInputRefs.current.splice(idx, 1);
  };

  const handleEndChange = (idx, value) => {
    setEnds((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const handleOptimizeRoute = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/optimize_route",
        { start, end: ends, vehicle_type: vehicleType, package_weight: packageWeight },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
      );
      setRoute(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "An error occurred while optimizing the route.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-500 to-blue-500 p-4 flex items-center justify-between shadow-lg">
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-white">
          <span className="inline-block text-white">Dynamic Route Optimizer</span>
        </h1>
        <button
          onClick={() => signOut(auth)}
          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-blue-500 shadow-md hover:scale-105 hover:from-green-600 hover:to-blue-600 transition-all font-semibold text-white"
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel (Inputs and Route Info) */}
        <div
          className={`glassmorphism-panel ${
            isMobile ? "w-full" : "w-[400px]"
          } overflow-y-auto rounded-xl m-4 flex-shrink-0 transition-all duration-300`}
          style={{
            background: "rgba(255,255,255,0.28)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
            border: "1.5px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
            minWidth: isMobile ? undefined : 340,
            maxWidth: isMobile ? undefined : 440,
          }}
        >
          <div className="px-6 py-8">
            <h2 className="text-xl font-extrabold text-gray-800 mb-5 tracking-tight">Route Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Location 1 (Start)</label>
                <input
                  type="text"
                  ref={startInputRef}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  placeholder="Enter start location"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition backdrop-blur shadow-inner focus:bg-white/70"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Location(s) (End)</label>
                {ends.map((end, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      ref={el => endInputRefs.current[idx] = el}
                      value={end}
                      onChange={e => handleEndChange(idx, e.target.value)}
                      placeholder={`Enter end location ${idx + 1}`}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-300 bg-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 text-base transition backdrop-blur shadow-inner focus:bg-white/70"
                      autoComplete="off"
                    />
                    {ends.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEnd(idx)}
                        className="p-2 rounded-full bg-gradient-to-tr from-green-400 to-blue-400 text-white hover:scale-110 transition-all shadow"
                        title="Remove"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddEnd}
                  className="mt-1 px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold shadow hover:scale-105 hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  + Add Destination
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition backdrop-blur shadow-inner focus:bg-white/70"
                >
                  <option value="car">Driving</option>
                  <option value="flying">Flying</option>
                  <option value="public-transport">Public Transport</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="bike">Bike</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Package Weight (kg)</label>
                <input
                  type="number"
                  value={packageWeight}
                  onChange={(e) => setPackageWeight(Number(e.target.value))}
                  placeholder="Enter package weight"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition backdrop-blur shadow-inner focus:bg-white/70"
                />
              </div>
              <button
                onClick={handleOptimizeRoute}
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-2xl font-extrabold text-lg shadow-lg hover:scale-105 hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Optimizing...
                  </span>
                ) : (
                  "Optimize Route"
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100/60 border border-red-300/60 text-red-700 rounded-lg text-xs backdrop-blur shadow">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {/* Route Info */}
            {route && (
              <div className="mt-5 space-y-3">
                {showBestRoute ? (
                  <RouteInfo
                    routeData={route.route.best_route}
                    emissions={route.emissions}
                    weather={route.weather}
                    airQuality={route.air_quality}
                    start={start}
                    end={Array.isArray(ends) ? ends.join(", ") : ends}
                    index={null}
                    packageWeight={packageWeight}
                  />
                ) : (
                  Array.isArray(route.route.other_routes) && route.route.other_routes.length > 0 ? (
                    route.route.other_routes.map((otherRoute, index) => (
                      <RouteInfo
                        key={index}
                        routeData={otherRoute.route || otherRoute}
                        emissions={
                          otherRoute.emissions !== undefined
                            ? otherRoute.emissions
                            : (route.alternative_routes && route.alternative_routes[index]?.emissions) || 0
                        }
                        weather={route.weather}
                        airQuality={route.air_quality}
                        start={start}
                        end={Array.isArray(ends) ? ends.join(", ") : ends}
                        index={index}
                        packageWeight={packageWeight}
                      />
                    ))
                  ) : (
                    <div className="text-xs text-gray-600 text-center py-2">No alternative routes available.</div>
                  )
                )}
                <button
                  onClick={() => setShowBestRoute(!showBestRoute)}
                  className="w-full mt-2 bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-xl font-semibold hover:scale-105 hover:from-green-600 hover:to-blue-600 transition-all text-xs shadow"
                >
                  {showBestRoute ? "Show Alternative Routes" : "Show Best Route"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right  (Map) */}
        <div className={`flex-1 ${isMobile ? "hidden" : "block"}`}>
          {route ? (
            showBestRoute ? (
              <MapComponent routeData={route.route.best_route} index={null} travelMode={travelMode} />
            ) : (
              route.route.other_routes.map((otherRoute, index) => (
                <MapComponent key={index} routeData={otherRoute.route} index={index} travelMode={travelMode} />
              ))
            )
          ) : (
            <div className="h-full bg-gradient-to-br from-gray-200 via-blue-100 to-purple-100 flex items-center justify-center">
              <p className="text-gray-600 text-lg font-semibold">Enter locations and optimize to see the map</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;