var location = {
    lat: 0,
    lng: 0
}

var settings = {}

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

        if (location.lat == undefined || location.lng == undefined || Math.abs(location.lat - json[1][0][5][0][1][0][2]) + Math.abs(location.lng - json[1][0][5][0][1][0][3]) > 0.01) {
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
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: type, data: data});
    // do something with response here, not outside the function
    console.log(response);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        // console.log(request.type)
        switch(request.type){
            case 'updated_setting':
                settings[request.setting] = request.state;
                break
            default:
                break;
        }
        console.log(settings)
    }
);