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
                break;

            default:
                console.log('something went wrong, no type specified')
                break;
        }

        sendResponse({ data: 'ok' });
    }
);