// Smooth button interaction
document.querySelectorAll("button").forEach(btn=>{
    btn.addEventListener("click",()=>{
        btn.style.transform="scale(0.95)";
        setTimeout(()=>btn.style.transform="scale(1)",150);
    });
});

function openModal(){
  const modal = document.getElementById("loginModal");
  modal.classList.add("active");

  // Disable scroll
  document.body.style.overflow = "hidden";
}

function closeModal(){
  const modal = document.getElementById("loginModal");
  modal.classList.remove("active");

  // Enable scroll again
  document.body.style.overflow = "auto";
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


window.addEventListener("click", function(e){
  const modal = document.getElementById("loginModal");
  if(e.target === modal){
    closeModal();
  }
});

function selectCard(selected, type){

  // Remove active class
  document.querySelectorAll(".dash-card").forEach(card=>{
    card.classList.remove("active");
  });

  selected.classList.add("active");

  const panel = document.getElementById("content-panel");

  panel.classList.remove("fade-in");

  setTimeout(()=>{

    if(type === "add"){
      panel.innerHTML = `
        <h2>Add Event</h2>
        <p>Create a new wedding or party event.</p>
        <a href="create-event.html" class="btn-primary">Create Event</a>
    `;

    }

    if(type === "events"){
      panel.innerHTML = `
        <h2>My Events</h2>
        <ul>
          <li>Wedding - 12 March 2026</li>
          <li>Birthday Party - 28 April 2026</li>
        </ul>
      `;
    }

    if(type === "nearby"){
      panel.innerHTML = `
        <h2>Nearby Wedding Halls</h2>
        <p>Showing venues near your location...</p>
      `;
    }

    if(type === "budget"){
      panel.innerHTML = `
        <h2>Budget Tracker</h2>
        <p>Total Budget: ₹5,00,000</p>
        <p>Spent: ₹2,75,000</p>
        <p>Remaining: ₹2,25,000</p>
      `;
    }

    panel.classList.add("fade-in");

  },150);
}
