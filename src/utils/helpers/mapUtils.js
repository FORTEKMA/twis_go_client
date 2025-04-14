export const filterDataByName = (data, filter) => {
  // Create a new object with the same outer structure
  const filteredData = {
    ...data, // Copy all top-level properties
    features: data.features.filter((feature) =>
      filter.includes(feature.properties.NAME_1)
    ), // Filter features
  };
  return filteredData;
};

export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const apiKey = process.env.API_GOOGLE;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    if (!response.ok) throw new Error("Error fetching geocode");
    const data = await response.json();
    if (data.status !== "OK")
      throw new Error(data.error_message || "Unknown error");
    return data.results[0]?.formatted_address || "Unknown location";
  } catch (error) {
    console.error("Error in getAddressFromCoordinates:", error);
    return "Error fetching address";
  }
};
