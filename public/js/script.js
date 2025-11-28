const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
}

const map = L.map("map").setView([0, 0], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const marrker = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  console.log(data);

  // Center map on the current user's location if this is *your* socket id
  if (id === socket.id) {
    map.setView([latitude, longitude], 13, { animate: true });
  }

  if (marrker[id]) {
    marrker[id].setLatLng([latitude, longitude]);
  } else {
    marrker[id] = L.marker([latitude, longitude]).addTo(map);
  }
});


socket.on("user-disconnected", (id) => {
  if (marrker[id]) {
    map.removeLayer(marrker[id]);
    delete marrker[id]; 
  }
});