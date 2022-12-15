/*
 * Author: S. aureus
 * Released under GPLv3 or any later version.
 */

// Constants
mimeType = { "audio/adpcm": ["adp"], "audio/amr": ["amr"], "audio/basic": ["au", "snd"], "audio/midi": ["mid", "midi", "kar", "rmi"], "audio/mobile-xmf": ["mxmf"], "audio/mp4": ["m4a", "mp4a"], "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"], "audio/ogg": ["oga", "ogg", "spx", "opus"], "audio/s3m": ["s3m"], "audio/silk": ["sil"], "audio/wav": ["wav"], "audio/webm": ["weba"], "audio/xm": ["xm"] }

// Functions
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
    var tmp = srcTable.getData();
    document.getElementById("playlist").replaceChildren();
    for (var item in tmp) {
        if (tmp[item][0] && tmp[item][1]) {
            var entry = document.createElement("option");
            entry.innerText = tmp[item][0];
            entry.value = tmp[item][1];
            document.getElementById("playlist").appendChild(entry);
        }
    }
    document.getElementById("playlist").size = tmp.length;
    if (tmp.length < 2) {
        document.getElementById("playlist").size = 2;
    }
    document.getElementById("playlist").disabled = tmp.length < 2;
    window.localStorage.setItem("songList", JSON.stringify(srcTable.getData()));
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

function initTableConfig() {
    return {
        "columns": [
            { "title": "Song", "width": "400px" },
            { "title": "URL", "width": "500px" }
        ],
        "allowInsertColumn": false,
        "allowDeleteColumn": false
    };
};

function loadFile(fileSrc, delimiter) {
    if (!delimiter) delimiter = "\t";
    tableConfig = initTableConfig();
    tableConfig["csv"] = fileSrc;
    tableConfig["csvHeaders"] = false;
    tableConfig["csvDelimiter"] = delimiter;
    tableConfig["onload"] = createPlaylist;
    document.getElementById("table").replaceChildren();
    srcTable = jspreadsheet(document.getElementById("table"), tableConfig);
}

function parseLocalFile(fileSrc, delimiter) {
    if (delimiter === false) {
        delimiter = prompt("Please provide the delimiter of the file you supplied.");
        if (delimiter === null) return;
        if (delimiter.charAt(0) === "\\") delimiter = eval("delimiter=\"" + delimiter + "\"");
    }
    var dataset = fileSrc.split("\n");
    var verified = [];
    var tmp;
    for (var i in dataset) {
        tmp = dataset[i].split(delimiter);
        if (tmp.length === 2) verified.push(tmp);
    }
    delete dataset;
    if (!verified) { alert("Failed to load the file content."); return; }
    tableConfig = initTableConfig();
    tableConfig["data"] = verified;
    document.getElementById("table").replaceChildren();
    srcTable = jspreadsheet(document.getElementById("table"), tableConfig);
    createPlaylist();
}

// Initialization
if (is_touch_enabled()) {
    document.getElementById("playlist").onchange = playSelected;
} else {
    document.getElementById("playlist").ondblclick = playSelected;
}

tableConfig = initTableConfig();

if (!window.localStorage.hasOwnProperty("songList") && confirm("It seems that this is the first time you opened this page. Do you want to load a default playlist?")) {
    loadFile("utaware.tsv", "\t");
} else {
    tableConfig["data"] = window.localStorage.hasOwnProperty("songList") ? JSON.parse(window.localStorage.getItem("songList")) : [["", ""]];
    srcTable = jspreadsheet(document.getElementById("table"), tableConfig);
    createPlaylist();
}

// Event Listeners
document.getElementById("load").onclick = createPlaylist;
document.getElementById("clear").onclick = () => {
    window.localStorage.clear();
    document.getElementById("table").replaceChildren();
    tableConfig = initTableConfig();
    tableConfig["data"] = [["", ""]];
    srcTable = jspreadsheet(document.getElementById("table"), tableConfig);
    createPlaylist();
};
document.getElementById("remote").onclick = () => {
    var src = prompt("Please provide the URL to the song list. Only TSV format is supported now.", "utaware.tsv");
    if (src) loadFile(src, "\t");
}
document.getElementById("upload").onclick = () => {
    document.getElementById("fileselector").click();
}
document.getElementById("fileselector").onchange = () => {
    var src = document.getElementById("fileselector").files;
    if (src.length) {
        format = src[0].name.match(/\.\w+$/)[0];
        delimiter = { ".csv": ",", ".tsv": "\t", ".psv": "|", ".txt": false };
        if (delimiter.hasOwnProperty(format)) {
            src[0].text().then((txt) => parseLocalFile(txt, delimiter[format]));
        } else {
            alert("Sorry but we can only load CSV, TSV, or PSV files right now.");
        }
    }
}

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
