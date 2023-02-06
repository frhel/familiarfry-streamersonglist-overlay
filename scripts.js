let songList = [];

let baseAPIUri = "https://api.streamersonglist.com/v1/streamers/7325/queue";

function fetchNewData() {
    fetch(baseAPIUri)
        .then(response => response.json())
        .then(data => updateSongList(data.list))
        .then(setTimeout(fetchNewData, 5000))
}
fetchNewData();

const updateSongList = (list) => {
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
        
        if (list[i].note === "lav") {
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
    
   songList = tempList;
   drawList();
}

const drawList = () => {
    let songListContainer = document.querySelector("ul.songList");
    let songListElems = document.querySelectorAll("ul.songList li");
    songListElems.forEach((val) => {
        val.remove();
    });

    for (i = 0; i < 1; i++) {
        let statusBoxVisible = "hide";
        let statusBoxText = "";
        let songElem = document.querySelector("li[data-id='" + songList[i].songId + "']");
        if (songElem === null) {
            statusBoxVisible = "visible";
            if (songList[i].note === "lav") {
                statusBoxText = "Like a Version";
            } else if (songList[i].note === "original") {
                statusBoxText = "Original";
            } else {
                statusBoxVisible = "hidden";
            }

            let newSong = document.createElement("li");
            newSong.setAttribute("data-id", songList[i].songId);
            newSong.setAttribute("class", "c" + i);
            songListContainer.appendChild(newSong);
            if (songList[i].artist != "N/A") {
                newSong.innerHTML = `
                <div class="statusBox ${statusBoxVisible}">${statusBoxText}</div>
                <div class="songLabel">Current Song</div>
                <div class="song">${songList[i].title}</div>
                <div class="artist"><span class="by">by</span>&nbsp; ${songList[i].artist}</div>
                <div class="requester">Requested by @${songList[i].requester}</div>`;
            }
        } else {
            songElem.setAttribute("class", "c" + i)
        }
    }
}

const idExists = (id) => {
    match = false;
    for (i = 0; i < songList.length; i++) {
        if (songList[i].songId == id) {
            match = true;
        }
    }

    return match;
}