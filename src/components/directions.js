// directions.js
export const calculateRoute = async (origin, destination) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE`
      );
      
      const data = await response.json();
      if (data.routes.length > 0) {
        return {
          distance: data.routes[0].legs[0].distance.value,
          duration: data.routes[0].legs[0].duration.text,
          coordinates: data.routes[0].overview_polyline.points
        };
      }
      return null;
    } catch (error) {
      console.error('Directions error:', error);
      return null;
    }
  };