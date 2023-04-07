class Square{
    constructor(dexNo, game, isShiny, isCompleted){
        this.dexNo = dexNo;
        this.game = game;
        this.isShiny = isShiny;
        this.isCompleted = isCompleted;
    }

    paramToArray() {
        return [this.dexNo, this.game, this.isShiny, this.isCompleted];
    }
}

window.onload = function(){
    let changerDiv = document.getElementById("mass-changer");
    changerDiv.querySelectorAll("select").forEach((e) => {
        e.onchange = function(){
            Array.from(document.getElementsByClassName(e.className)).forEach((f) => {
                f.value = e.value;
            })
        }
    })
}

function requestBingoCard(){
    pokemonList = [];
    document.querySelectorAll(".input-td").forEach((e) => {
        pokemon = new Square();
        e.querySelectorAll("select").forEach((f) => {
            pokemon[f.name] = f.value;
        })
        pokemonList.push(pokemon);
    })

    pokemonList.pop()   // Mass changer buttons are also added, resulting in one pokemon too much

    for(let i = 0; i < pokemonList.length; i++){
        pokemonList[i] = pokemonList[i].paramToArray();
    }
    generateBingoCard(pokemonList);
}

function generateBingoCard(pokemonList){
    // Create Post Request
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "/bingo");

    xmlHttp.onreadystatechange = function() {
        if(xmlHttp.readyState == 4){
            if(xmlHttp.status == 200){
                path = xmlHttp.responseText;
                const img = new Image(); 
                img.src = path;
                document.getElementById("bingo-div").replaceChildren(img);
            }else{
                console.log("error: ", xmlHttp);
            }
        }
    }

    // Initialize Formdata
    let fd = new FormData();
    fd.append("pokemon", JSON.stringify(pokemonList));

    xmlHttp.send(fd);
}

// Generates a string based on the current board, which has all select values in order separated by spaces
function boardToString(){
    let str = "";
    document.querySelectorAll("select").forEach((e) => {
        str += e.value + " ";
    });
    return str;
}

// Takes a string as argument and changes the board to reflect the contents of the string
function stringToBoard(str){
    board = document.querySelectorAll("select");
    let data = str.split(" ");
    let counter = 0;

    // input checks
    if(board.length != data.length){
        throw ("IllegalArgumentException: The supplied string has the wrong length. The expected length is " + board.length + ", but was " + data.length);
    }

    board.forEach((e) => {
        e.value = data[counter];
        counter++;
    });
}

// Stores current state of the board, to later restore using loadBoard() (board is deleted after 1 year)
function saveBoard(){
    setCookie("board", boardToString(), 365);
}

// Loads the board in the state it was when last saved
function loadBoard(){
    let board = getCookie("board");
    if(board == ""){
        console.log("No board is stored. Please store a board first. If you believe you have stored a board in the past, either you removed your cookies or the cookie expired (the cookie is deleted after 365 days)");
        return;
    }

    stringToBoard(board);
}

// Function to set a cookie
// cname is the name of the cookie, cvalue is the value of the cookie, exdays is the amount of days the cookie is stored
// Source: https://www.w3schools.com/js/js_cookies.asp 
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Strict";
}

// Function to get a cookie
// cname is the name of the cookie, the result is the associated value (or empty string if cookie isn't set)
// Source: https://www.w3schools.com/js/js_cookies.asp 
function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}