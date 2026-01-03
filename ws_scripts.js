const client = io(`https://api.streamersonglist.com`);
const streamerId = '7325';
client.on('connect', () => {
    console.log(client.id);
  // streamerId is the numeric `id` from `/streamers/<streamer-name` endpoint
  // but needs to be cast as a string for the socket event
  client.emit('join-room', `${streamerId}`);
});

client.on('queue-update', async () => {
    console.log('fetching new data')
    await fetchNewData();
    drawInfo();
});

client.on('update-streamer', async () => {
    console.log('fetching new streamer data')
    await fetchStreamerData();
    drawInfo();
});

client.on('disconnect', () => {
    console.log('disconnected');
})

let _songList = [];

let _baseAPIUri = "https://api.streamersonglist.com/v1/streamers/7325";

let _globalData = new Object;

// Requester name shortcuts - map short codes to full names
const requesterShortcuts = {
    "f": "Fry",
    "z": "Zion",
    "l": "Lundin",
    "fa": "FaustianOrgan",
    "j": "onlyjakeroberts",
    "r": "Ratafluff"
};

// Valid note types for song status
const validNotes = ["lav", "improv", "ll", "original", "end"];

// Note display text mapping
const noteDisplayText = {
    "lav": "Like a Version",
    "improv": "Improvised Song",
    "ll": "Live Learn",
    "original": "Original",
    "end": "End of Stream"
};

// ------------------------------------------- //
// -------------Streamer Stuff --------------- //
async function fetchStreamerData() {
    await fetch(_baseAPIUri)
        .then(response => response.json())
        .then(data => updateStreamerData(data))
}
fetchStreamerData();

const updateStreamerData = (data) => {
    _globalData.concurrentRequests = data.concurrentRequests;
    _globalData.requestsActive = data.requestsActive;
    drawInfo();
}

// ------------------------------------------- //
// -------------Songlist Stuff --------------- //
async function fetchNewData() {
    await fetch(_baseAPIUri + "/queue")
        .then(response => response.json())
        .then(data => updateSongList(data.list))
}
fetchNewData();

const updateSongList = (list) => {
    console.log(list)
    const tempList = [];
    for (let i = 0; i < list.length; i++) {
        tempList[i] = new Object;
        tempList[i].originalSong = false;
        if (list[i].song && list[i].song.attributeIds.length > 0) {
            for (let y = 0; y < list[i].song.attributeIds.length; y++) {
                if (list[i].song.attributeIds[y] === 40118) {
                    tempList[i].originalSong = true;
                }
            }
        }
        if (typeof list[i].nonlistSong === "string") {
            if (list[i].nonlistSong.includes(" - ")) {
                const splitStr = list[i].nonlistSong.split(" - ");
                tempList[i].artist = splitStr[0];
                tempList[i].title = splitStr[1];
            } else {
                tempList[i].title = list[i].nonlistSong;
                tempList[i].artist = "";
            }
        } else {
            tempList[i].title = list[i].song.title;
            tempList[i].artist = list[i].song.artist;
        }

        const noteValue = list[i].note?.toLowerCase() || "";
        tempList[i].note = validNotes.includes(noteValue) ? noteValue
                          : tempList[i].originalSong ? "original"
                          : "";

        tempList[i].songId = list[i].id;
        if (list[i].requests[0].name) {
            tempList[i].requester = list[i].requests[0].name;
        } else {
            tempList[i].requester = "";
        }

        // Apply requester shortcuts if a match exists
        const shortcut = tempList[i].requester.toLowerCase();
        if (requesterShortcuts[shortcut]) {
            tempList[i].requester = requesterShortcuts[shortcut];
        }
    }

    _songList = tempList;
    drawList();
    drawInfo();
}

// ------------------------------------------- //
// ------------- Drawing Stuff --------------- //
function drawInfo() {

    let songRequestStatus = document.querySelector("li.song_request_status span");
    let queueCount = document.querySelector("li.queue_status span.curr_song_count");
    let queueMax = document.querySelector("li.queue_status span.max_song_count");

    if (_globalData.requestsActive === true) {
        songRequestStatus.innerHTML = "Open";
        songRequestStatus.classList = "active green";
    } else {
        songRequestStatus.innerHTML = "Closed";
        songRequestStatus.classList = "";
    }

    queueMax.innerHTML = _globalData.concurrentRequests;
    queueCount.innerHTML = _songList.length;

    if (_songList.length >= _globalData.concurrentRequests) {
        queueCount.classList = "curr_song_count";
    } else {
        queueCount.classList = "curr_song_count green";
    }
}

const drawList = () => {
    if (!_songList.length) {
        return;
    }

    let statusDiv = document.getElementById("statusBox");
    let songDiv = document.getElementById("song");
    let artistDiv = document.getElementById("artist");
    let requesterDiv = document.getElementById("requester");


    let firstSong = _songList[0];

    const statusBoxText = noteDisplayText[firstSong.note] || "";
    const statusBoxVisible = statusBoxText ? "visible" : "out";

    if (firstSong.title != songDiv.innerHTML) {
        statusDiv.setAttribute("class", "out");
        songDiv.setAttribute("class", "out");
        artistDiv.setAttribute("class", "out");
        requesterDiv.setAttribute("class", "out");

        setTimeout(() => {
            songDiv.setAttribute("class", "hidden");
            artistDiv.setAttribute("class", "hidden");
            requesterDiv.setAttribute("class", "hidden");
        }, 1400)

        setTimeout(() => {
            statusDiv.innerHTML = statusBoxText;
            statusDiv.setAttribute("class", statusBoxVisible);

            songDiv.innerHTML = firstSong.title;
            songDiv.setAttribute("class", "");

            artistDiv.innerHTML = `<span class="by">by</span>&nbsp; ${firstSong.artist}`;
            artistDiv.setAttribute("class", "");

            requesterDiv.innerHTML = `Requested by @${firstSong.requester}`;
            requesterDiv.setAttribute("class", "");
        }, 1500);
    } else if (statusBoxText != statusDiv.innerHTML) {
        statusDiv.setAttribute("class", "out");

        setTimeout(() => {
            statusDiv.innerHTML = statusBoxText;
            statusDiv.setAttribute("class", statusBoxVisible);
        }, 700)
    }
}

const idExists = (id) => {
    let match = false;
    for (let i = 0; i < _songList.length; i++) {
        if (_songList[i].songId == id) {
            match = true;
        }
    }

    return match;
}