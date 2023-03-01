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
    tempList = [];
    for (i = 0; i < list.length; i++) {
        tempList[i] = new Object;
        tempList[i].originalSong = false;
        if (list[i].song && list[i].song.attributeIds.length > 0) {
            for (y = 0; y < list[i].song.attributeIds.length; y++) {
                if (list[i].song.attributeIds[y] === 40118) {
                    tempList[i].originalSong = true;
                }
            }
        }
        if (typeof list[i].nonlistSong === "string") {
            if (list[i].nonlistSong.includes(" - ")) {
                splitStr = list[i].nonlistSong.split(" - ");
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

        if (list[i].note === "lav" || list[i].note === "improv"|| list[i].note === "ll" || list[i].note === "original") {
            tempList[i].note = list[i].note.toLowerCase();
        } else if (tempList[i].originalSong === true) {
            tempList[i].note = "original";
        } else {
            tempList[i].note = "";
        }

        tempList[i].songId = list[i].id;
        if (list[i].requests[0].name) {
            tempList[i].requester = list[i].requests[0].name;
        } else {
            tempList[i].requester = "";
        }
        if (tempList[i].requester.toLowerCase() === "f") {
            tempList[i].requester = "Fry";
        } else if (tempList[i].requester.toLowerCase() === "z") {
            tempList[i].requester = "Zion";
        } else if (tempList[i].requester.toLowerCase() === "l") {
            tempList[i].requester = "Lundin";
        } else if (tempList[i].requester.toLowerCase() === "fa") {
            tempList[i].requester = "FaustianOrgan";
        } else if (tempList[i].requester.toLowerCase() === "j") {
            tempList[i].requester = "onlyjakeroberts";
        } else if (tempList[i].requester.toLowerCase() === "r") {
            tempList[i].requester = "Ratafluff";
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
    let songListContainer = document.querySelector("ul.songList");
    let songListElems = document.querySelectorAll("ul.songList li");
    songListElems.forEach((val) => {
        val.remove();
    });

    if (!_songList.length) {
        return;
    }
    for (i = 0; i < 1; i++) {
        let statusBoxVisible = "hide";
        let statusBoxText = "";
        let songElem = document.querySelector("li[data-id='" + _songList[i].songId + "']");
        if (songElem === null) {
            statusBoxVisible = "visible";
            if (_songList[i].note === "lav") {
                statusBoxText = "Like a Version";
            } else if (_songList[i].note === "improv") {
                statusBoxText = "Improvised Song";
            } else if (_songList[i].note === "ll") {
                statusBoxText = "Live Learn";
            } else if (_songList[i].note === "original") {
                statusBoxText = "Original";
            } else {
                statusBoxVisible = "hidden";
            }

            let newSong = document.createElement("li");
            newSong.setAttribute("data-id", _songList[i].songId);
            newSong.setAttribute("class", "c" + i);
            songListContainer.appendChild(newSong);
            if (_songList[i].artist != "N/A") {
                newSong.innerHTML = `
                <div class="statusBox ${statusBoxVisible}">${statusBoxText}</div>
                <div class="songLabel">Current Song</div>
                <div class="song">${_songList[i].title}</div>
                <div class="artist"><span class="by">by</span>&nbsp; ${_songList[i].artist}</div>
                <div class="requester">Requested by @${_songList[i].requester}</div>`;
            }
        } else {
            songElem.setAttribute("class", "c" + i)
        }
    }
}

const idExists = (id) => {
    match = false;
    for (i = 0; i < _songList.length; i++) {
        if (_songList[i].songId == id) {
            match = true;
        }
    }

    return match;
}