var toggles = document.querySelectorAll("[data-toggle]");

toggles.forEach((ele) => {
    // console.log(ele.dataset)
    ele.addEventListener('change', (e) => {
        // console.log(e)
        var state = e.target.checked;
        var toggle = e.target.dataset.toggle

        updateInner(toggle, state)

        // chrome.storage.local.set({ toggle: state });s

        chrome.storage.local.set({ [toggle]: state }).then(() => {
            console.log("Value is set to " + state);
        });



        chrome.runtime.sendMessage({ type: 'updated_setting', setting: e.target.dataset.toggle, state: state });
    });

    chrome.storage.local.get([ele.dataset.toggle], (str) => {
        // console.log(str)
        ele.checked = str[ele.dataset.toggle];
        updateInner(ele.dataset.toggle, ele.checked)
    });
})

document.querySelectorAll("[data-link]").forEach((e) => {
    e.addEventListener('click', () => {
        chrome.tabs.create({
            url: e.dataset.link,
            selected: true,
        })
    })
})

function updateInner(toggle, state) {
    var inner = document.querySelector("[data-inner=\"" + toggle + "\"]");

    if (inner != undefined) {
        if (state) {
            inner.style.opacity = '1'
            inner.style.pointerEvents = 'all'
        }
        else {
            inner.style.opacity = '0.5'
            inner.style.pointerEvents = 'none'
        }
    }
    // console.log(inner)
}
