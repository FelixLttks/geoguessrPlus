var geo_location = {}
var settings = {}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {


        console.log(request);
        switch (request.type) {
            case 'new_location':
                geo_location = request.data;
                break;

            case 'updated_settings':
                settings = request.data;
                console.log(settings)
                break;

            default:
                console.log('something went wrong, no type specified')
                break;
        }

        updateScreen()
        sendResponse({ data: 'ok' });
    }
);

var html = [
    `<div style="position: fixed; top: 4rem; width: 100vw; left: 0;  display: flex; justify-content: center;">
        <div id="geopladdress" style="background-color: #10101c80; height: 2rem; display: flex; justify-content: center; align-items: center; border-radius: 1rem; padding: 0 .5rem; font-weight: 700;">
            here is the place for the address
        </div>  
    </div>`,
    `<div style="position: fixed; bottom: 1rem; width: 100vw; left: 0;  display: flex; justify-content: center; pointer-events: none;">
        <div id="geoplcountry" style="background-color: #10101c80; height: 2rem; display: flex; justify-content: center; align-items: center; border-radius: 1rem; padding: 0 .5rem; font-weight: 700;">
            here is the place for the address
        </div>  
    </div>`,
    `<div id="geoplmap" style="height: 175px; width: 200px;position: fixed; bottom: 6rem;right: 2rem; z-index: 100;"></div>`
]

var map = undefined;
var layerGroup = undefined;

initScreen();

function initScreen() {
    console.log('initScreen')
    html.forEach((e) => {
        var obj = document.createElement('div');
        obj.innerHTML = e;
        document.body.appendChild(obj)
    })

    initMap()
}

function initMap() {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.css';
    document.getElementsByTagName('HEAD')[0].appendChild(link);

    console.log('script loaded')
    var element = document.getElementById('geoplmap');

    map = L.map(element, { attributionControl: false });
    layerGroup = L.layerGroup();

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var target = L.latLng(0, 0);

    map.setView(target, 4);
}

function setMapLocation(lat, lng) {
    var target = L.latLng(lat, lng);

    map.setView(target, 4);

    layerGroup.clearLayers();
    var marker = L.marker(target);

    layerGroup.addLayer(marker);
    map.addLayer(layerGroup);
}

function updateScreen() {
    console.log('updateScreen()')
    if (settings.solution && settings.address) {
        document.getElementById('geopladdress').innerHTML = geo_location.address
        document.getElementById('geopladdress').style.opacity = '1';
    }else{
        document.getElementById('geopladdress').style.opacity = '0';
    }

    if (settings.solution && settings.country) {
        document.getElementById('geoplcountry').innerHTML = geo_location.country_code.toUpperCase() + ': ' + geo_location.country
        document.getElementById('geoplcountry').style.opacity = '1';
    }else{
        document.getElementById('geoplcountry').style.opacity = '0';
    }

    if (settings.solution && settings.map) {
        setMapLocation(geo_location.lat, geo_location.lng)
        document.getElementById('geoplmap').style.opacity = '1';
    }else{
        document.getElementById('geoplmap').style.opacity = '0';
    }
}