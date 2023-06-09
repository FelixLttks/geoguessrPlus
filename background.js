var location = {
    lat: 0,
    lng: 0,
    address: 'none',
    country: 'none',
    country_code: '--'
};

var settings = {};

chrome.webRequest.onCompleted.addListener(async (request) => {
    if (request.method !== 'GET' || request.type !== 'script' || !request.url.includes('GeoPhotoService')) {
        return;
    }

    await fetch(request.url).then((response) => {
        return response.text();
    }).then((data) => {
        // getting the actual data out of the respone using regex 
        var regex = /\((.*)\)/gm
        var result = regex.exec(data)[1]
        var json = JSON.parse(result)

        // console.log(Math.abs(location.lat - json[1][0][5][0][1][0][2]) + Math.abs(location.lng - json[1][0][5][0][1][0][3]))

        if (location.lat == undefined || location.lng == undefined || Math.abs(location.lat - json[1][0][5][0][1][0][2]) + Math.abs(location.lng - json[1][0][5][0][1][0][3]) > 0.005) {
            location = {
                lat: json[1][0][5][0][1][0][2],
                lng: json[1][0][5][0][1][0][3],
            }

            // console.log(location);

            fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + location.lat + '&&lon=' + location.lng).then((r) => {
                return r.text();
            }).then((geoData) => {
                geoData = JSON.parse(geoData)

                location.address = geoData.display_name;
                location.country = geoData.address.country;
                location.country_code = geoData.address.country_code;

                // console.log(location);

                sendData('new_location', location)
            });

        }
    });

}, { urls: ['<all_urls>'] });

async function sendData(type, data) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }); //active: true, 
    const response = await chrome.tabs.sendMessage(tab.id, { type: type, data: data });
    // do something with response here, not outside the function
    console.log(response);
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request)
        switch (request.type) {
            case 'updated_setting':
                if(settings == undefined){
                    settings = {};
                }
                settings[request.setting] = request.state;
                sendData('updated_settings', settings);
                break
            case 'keydown_event':
                switch (request.data) {
                    case 'send_country':
                        sendCountry(request.country_code, request.token);
                        break;
                }
                break;
            case 'get_round':
                var roundNumber = -1;
                var token = request.token
                fetch('https://game-server.geoguessr.com/api/battle-royale/' + token + '/reconnect').then((r) => {
                    return r.text();
                }).then((data) => {
                    roundNumber = JSON.parse(data).rounds.length

                    console.log(roundNumber)
                    sendData('new_roundnumber', roundNumber)
                });
                


                break;
            default:
                break;
        }
        console.log(settings)
    }
);

chrome.webNavigation.onCompleted.addListener(function (details) {

    chrome.storage.local.get('settings', (str) => {
        settings = str.settings

        console.log('page loaded')
        console.log(settings)
        sendData('new_location', location);
        sendData('updated_settings', settings);
    });
}, {
    url: [{
        hostContains: '.geoguessr.com'
    }],
});