var geo_location = {}
var settings = {}
var country = 'de';

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {


        // console.log(request);
        switch (request.type) {
            case 'new_location':
                geo_location = request.data;
                break;

            case 'updated_settings':
                settings = request.data;
                // console.log(settings)
                break;

            case 'new_roundnumber':
                // console.log(request)

                var token = window.location.href.split('/').pop()

                fetch("https://game-server.geoguessr.com/api/battle-royale/" + token + "/guess", {
                    "headers": {
                        "content-type": "application/json"
                    },
                    "body": "{\"lat\":0,\"lng\":0,\"countryCode\":\"" + country + "\",\"roundNumber\":" + request.data + "}",
                    "method": "POST",
                    "credentials": "include"
                });

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
    `<div style=" z-index: 100;position: fixed; top: 4rem; width: 100vw; left: 0;  display: flex; justify-content: center; pointer-events: none;">
        <div id="geopladdress" style="opacity: 0; z-index: 100; background-color: #10101c80; height: 2rem; display: flex; justify-content: center; align-items: center; border-radius: 1rem; padding: 0 .5rem; font-weight: 700; pointer-events: none">
            here is the place for the address
        </div>  
    </div>`,
    `<div style="position: fixed; z-index: 100; bottom: 1rem; width: 100vw; left: 0;  display: flex; justify-content: center; pointer-events: none;">
        <div id="geoplcountry" style="opacity: 0; z-index: 100; background-color: #10101c80; height: 2rem; display: flex; justify-content: center; align-items: center; border-radius: 1rem; padding: 0 .5rem; font-weight: 700;">
            here is the place for the address
        </div>  
    </div>`,
    `<div id="geoplmap" style="opacity: 0; height: 175px; width: 200px;position: fixed; bottom: 6rem;right: 2rem; z-index: 100;"></div>`,
    `<div style="position: fixed; bottom: 1rem; right: 2rem; pointer-events: none; z-index: 100;">
    
        <input id="geoplfastcountry" type="text" placeholder="cc" style="width: 200px; text-align: center;">
      
</div>
    `
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
    console.log(settings)
    console.log(geo_location)

    if(geo_location == {} || geo_location == undefined){
        console.log('now location found');
        return
    }
    if (settings.solution && settings.address) {
        document.getElementById('geopladdress').innerHTML = geo_location.address
        document.getElementById('geopladdress').style.opacity = '1';
    } else {
        document.getElementById('geopladdress').style.opacity = '0';
    }

    if (settings.solution && settings.country) {
        document.getElementById('geoplcountry').innerHTML = geo_location.country_code.toUpperCase() + ': ' + geo_location.country
        document.getElementById('geoplcountry').style.opacity = '1';
    } else {
        document.getElementById('geoplcountry').style.opacity = '0';
    }

    if (settings.solution && settings.map) {
        setMapLocation(geo_location.lat, geo_location.lng)
        document.getElementById('geoplmap').style.opacity = '1';
    } else {
        document.getElementById('geoplmap').style.opacity = '0';
    }

    if (settings.fastcountry) {
        document.getElementById('geoplfastcountry').style.opacity = '1';
    } else {
        document.getElementById('geoplfastcountry').style.opacity = '0';
    }
}

// function getSegment(url, index) {
//     return url.replace(/^https?:\/\//, '').split('/')[index];
// }



document.addEventListener("keypress", async function (event) {
    var keycode = event.keyCode
    console.log(keycode)
    if (keycode >= 97 && keycode <= 122) {
        country += event.key;
        country = country.substr(1);
        // console.log(country)
        document.getElementById('geoplfastcountry').value = country;
    }
    else if (keycode == 13) {
        console.log(window.location.href.includes('battle-royale'))
        console.log(settings.fastcountry)
        if (window.location.href.includes('battle-royale') && settings.fastcountry) {
            console.log('sent');
            var token = window.location.href.split('/').pop()
            const response = await chrome.runtime.sendMessage({ type: 'get_round', token: token });
            // do something with response here, not outside the function
            console.log(response);
        }
    } 
    else if(keycode == 223){
        console.log("%c" + geo_location.address, "background-color:#3B3BB1; padding:20px;")
        console.log("%c" + geo_location.country_code.toUpperCase() + ': ' + geo_location.country, "background-color:#3B3BB1; padding:20px;")
    }
});