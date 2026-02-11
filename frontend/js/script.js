// Smooth button interaction
document.querySelectorAll("button").forEach(btn=>{
    btn.addEventListener("click",()=>{
        btn.style.transform="scale(0.95)";
        setTimeout(()=>btn.style.transform="scale(1)",150);
    });
});

function openModal(){
  document.getElementById("loginModal").style.display="flex";
}

function closeModal(){
  document.getElementById("loginModal").style.display="none";
}

/* Scroll Animation */
const elements = document.querySelectorAll(".two-column, .feature-box");

window.addEventListener("scroll",()=>{
  elements.forEach(el=>{
    const position = el.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;
    if(position < screenHeight - 100){
      el.classList.add("show");
    }
  });
});

let map;
let userMarker;

function initMap(){
    map = L.map('map').setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    detectLocation();
}

function detectLocation(){

    if(!navigator.geolocation){
        document.getElementById("mapLoader").style.display = "none";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(position){

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            userMarker = L.marker([lat, lon])
                .addTo(map)
                .bindPopup("📍 You are here")
                .openPopup();

            map.setView([lat, lon], 14);

            addNearbyEvents(lat, lon);

            // Smooth fade out loader
            const loader = document.getElementById("mapLoader");
            loader.style.opacity = "0";
            setTimeout(() => loader.style.display = "none", 400);
        }
    );
}

/* ===== ADD NEARBY EVENT MARKERS ===== */
function addNearbyEvents(lat, lon){

    const events = [
        { name: "Wedding Hall", lat: lat + 0.01, lon: lon + 0.01 },
        { name: "Birthday Venue", lat: lat - 0.008, lon: lon + 0.005 },
        { name: "Corporate Event Space", lat: lat + 0.006, lon: lon - 0.01 }
    ];

    events.forEach(event => {
        L.marker([event.lat, event.lon])
            .addTo(map)
            .bindPopup("🎉 " + event.name);
    });
}

window.onload = initMap;


