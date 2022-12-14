mimeType = { "audio/adpcm": ["adp"], "audio/amr": ["amr"], "audio/basic": ["au", "snd"], "audio/midi": ["mid", "midi", "kar", "rmi"], "audio/mobile-xmf": ["mxmf"], "audio/mp4": ["m4a", "mp4a"], "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"], "audio/ogg": ["oga", "ogg", "spx", "opus"], "audio/s3m": ["s3m"], "audio/silk": ["sil"], "audio/wav": ["wav"], "audio/webm": ["weba"], "audio/xm": ["xm"] }

function askForListUrl() {
    // Test:  https://gist.githubusercontent.com/neruthes/ebbbfdf3b5e15b875c0f93d51803e877/raw/7f93acc66c7ab2bb0f0fa0503519206df282b7d7/duckoss-list-genshinost.txt
    const remoteListUrl = prompt('Paste the remote list URL here...');
    console.log(`remoteListUrl: ${remoteListUrl}`);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', remoteListUrl);
    xhr.send();
    xhr.onload = function (e) {
        // console.log(e.target.responseText);
        const txt = e.target.responseText;
        console.log(txt);
        const tabledata = txt.trim().split('\n').map((x, i) => {
            return x.split('\t');
        });
        console.log(tabledata);
        window.tableConfig.data = tabledata;
        // Reload table now
        document.getElementById('table').innerHTML = '';
        reloadTable();
        createPlaylist();
    };
    // jspreadsheet(document.getElementById('table'), { csv: remoteListUrl, csvDelimiter: '\t' });
}

function getMimeType(ext) {
    for (var item in mimeType) {
        if (mimeType[item].includes(ext)) return item;
    }
    return "audio/mpeg";
}

function changeSong(song, url) {
    var tmp = document.createElement("source");
    tmp.src = url;
    var ext = song.split(".").pop();
    tmp.type = getMimeType(ext);
    document.getElementById("player").replaceChildren(tmp);
    document.getElementById("player").load();
    document.getElementById("player").play();
}

function playNext() {
    var pl = document.getElementById("playlist");
    if (document.getElementById("loop").value === "single") {
        document.getElementById("player").currentTime = 0;
    } else {
        if (document.getElementById("playshuffle").checked) {
            var nextSong = Math.floor(Math.random() * pl.size);
            pl.selectedIndex = nextSong;
            playSelected();
        } else {
            if (pl.selectedIndex !== pl.size - 1) {
                pl.selectedIndex += 1;
                playSelected();
            } else {
                if (document.getElementById("loop").value === "All") {
                    pl.selectedIndex = nextSong;
                    playSelected();
                }
            }
        }
    }
}

function secToTime(x, maxTime) {
    var result = "";
    if (maxTime >= 3600) {
        result = Math.floor(x / 3600) + ":";
        x %= 3600;
    }
    return result + Math.floor(x / 60).toString().padStart(2, "0") + ":" + (x.toFixed() % 60).toString().padStart(2, "0");
}

function is_touch_enabled() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
}

function createPlaylist() {
    var tmp = window.srcTable.getData();
    document.getElementById("playlist").replaceChildren();
    for (var item in tmp) {
        var entry = document.createElement("option");
        entry.innerText = tmp[item][0];
        entry.value = tmp[item][1];
        document.getElementById("playlist").appendChild(entry);
    }
    document.getElementById("playlist").size = tmp.length;
    if (tmp.length < 2) {
        document.getElementById("playlist").size = 2;
    }
    document.getElementById("playlist").disabled = tmp.length < 2;
    window.localStorage.setItem("songList", JSON.stringify(window.srcTable.getData()));
}

function updatePlayer() {
    document.getElementById("playprogress").value = document.getElementById("player").currentTime;
    document.getElementById("currentpos").innerText = secToTime(document.getElementById("player").currentTime, document.getElementById("player").duration);
}

function playSelected() {
    var src = document.getElementById("playlist").selectedOptions[0];
    changeSong(src.innerText, src.value);
    document.getElementById("playpause").innerText = "Loading...";
    document.getElementById("playpause").disabled = true;
    document.getElementById("debug").innerText = "Song " + src.innerText + " loading...";
}

if (is_touch_enabled()) {
    document.getElementById("playlist").onchange = playSelected;
} else {
    document.getElementById("playlist").ondblclick = playSelected;
}

window.tableConfig = {
    "columns": [
        { "title": "Song", "width": "400px" },
        { "title": "URL", "width": "500px" }
    ],
    "allowInsertColumn": false,
    "allowDeleteColumn": false,
};

if (window.localStorage.hasOwnProperty("songList")) {
    window.tableConfig["data"] = JSON.parse(window.localStorage.getItem("songList"));
} else {
    if (confirm("It seems that this is the first time you opened this page. Do you want to load a default playlist?")) {
        window.tableConfig["csv"] = "utaware.tsv";
        window.tableConfig["csvHeaders"] = false;
        window.tableConfig["csvDelimiter"] = "\t";
        window.tableConfig["onload"] = createPlaylist;
    } else {
        window.tableConfig["data"] = [[]];
    }
}


function reloadTable() {
    window.srcTable = jspreadsheet(document.getElementById("table"), window.tableConfig);
}

// Just want to reloadTable(), but calling the function here results an error elsewhere. Why?
window.srcTable = jspreadsheet(document.getElementById("table"), window.tableConfig);



if (!window.tableConfig.hasOwnProperty("onload")) createPlaylist();

document.getElementById("load").onclick = createPlaylist;
document.getElementById("clear").onclick = () => { window.localStorage.clear() };

document.getElementById("loop").onchange = () => {
    if (document.getElementById("loop").value === "Single") {
        document.getElementById("shuffleswitch").style.display = "none";
    } else {
        document.getElementById("shuffleswitch").style.removeProperty("display");
    }
}

document.getElementById("player").onplaying = () => {
    playerUpdate = setInterval(updatePlayer, 500);
    document.getElementById("playpause").innerText = "Pause";
    document.getElementById("playpause").onclick = () => { document.getElementById("player").pause() }
    document.getElementById("playpause").disabled = false;
    document.getElementById("debug").innerText = "Playing...";
}
document.getElementById("player").onpause = () => {
    clearInterval(playerUpdate);
    updatePlayer();
    document.getElementById("playpause").innerText = "Play";
    document.getElementById("playpause").onclick = () => { document.getElementById("player").play() }
    document.getElementById("debug").innerText = "Paused.";
}
document.getElementById("player").onloadedmetadata = () => {
    document.getElementById("playprogress").max = document.getElementById("player").duration;
    document.getElementById("length").innerText = secToTime(document.getElementById("player").duration, document.getElementById("player").duration);
}
document.getElementById("player").onerror = () => {
    document.getElementById("debug").innerText = "Error playing file.";
}
document.getElementById("player").onended = playNext;
document.getElementById("askForListUrl").onclick = askForListUrl;
