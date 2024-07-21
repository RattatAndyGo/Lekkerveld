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
    // Add onchange events to inputs
    let changerDiv = document.getElementById("mass-changer");
    changerDiv.querySelectorAll("select").forEach((e) => {
        e.onchange = function(){
            Array.from(document.getElementsByClassName(e.className)).forEach((f) => {
                f.value = e.value;
            });
        }
    });
}

function requestBingoCard(){
    generateBingoCard(inputsToArray());
}

// Looks at the input fields and creates an array of arrays of the requested pokemon
function inputsToArray(){
    let pokemonList = [];
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
    return pokemonList;
}

function generateBingoCard(pokemonList){
    // Create Post Request
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "/bingo-generate");

    xmlHttp.onload = function() {
        if(xmlHttp.status == 200){
            path = xmlHttp.responseText;
            if(path == "requestOverload"){
                document.getElementById("bingo-div").replaceChildren("You generated too many bingo cards too quickly.");
                return;
            }

            const img = new Image(); 
            img.src = path;
            img.id = "bingo-card-image"
            document.getElementById("bingo-div").replaceChildren(img);
        }else{
            console.log("error: ", xmlHttp);
        }
    
    }

    // Initialize Formdata
    let fd = new FormData();
    fd.append("id", JSON.stringify(getCookie("idToken")));
    fd.append("pokemon", JSON.stringify(pokemonList));

    xmlHttp.send(fd);
}

// Given an uploaded card, changes the input board to reflect the card
function cardToInput(){
    document.querySelectorAll(".reverse-engineer-button").forEach((e) => e.innerHTML = "Loading...");

    // Create Post Request
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "/bingo-card-to-input");

    xmlHttp.onload = function() {
        if(xmlHttp.status == 200){
            jsonToBoard(xmlHttp.responseText);
            document.querySelectorAll(".reverse-engineer-button").forEach((e) => e.innerHTML = "Reverse engineer card");
        }else{
            document.querySelectorAll(".reverse-engineer-button").forEach((e) => e.innerHTML = "Reverse engineer card");
            console.log("error: ", xmlHttp);
        }
    }

    // Initialize Formdata
    try{
        let card = document.getElementById("card-to-input");
        let fd = new FormData();
        fd.append(card.getAttribute("name"), card.files[0], card.files[0].name);
        xmlHttp.send(fd);
    } catch {
        document.querySelectorAll(".reverse-engineer-button").forEach((e) => e.innerHTML = "Reverse engineer card");
        return;
    }
}

// Generates a JSON string based on the current input board
function boardToString(){
    return JSON.stringify(inputsToArray())
}

// Takes an array of arrays as argument and changes the board to reflect the contents of the array
function arrayToBoard(pokemonList){
    pokemonList = pokemonList.flat();
    board = document.querySelectorAll("select");

    // input checks
    if(board.length != pokemonList.length){
        throw ("IllegalArgumentException: The supplied string has the wrong length. The expected length is " + board.length + ", but was " + pokemonList.length);
    }

    let counter = 0;
    board.forEach((e) => {
        e.value = pokemonList[counter];
        counter++;
    });
}

// Takes json as argument and changes the board to reflect the contents of the json
function jsonToBoard(array){
    array = JSON.parse(array);
    array.push(["random", "random", "normal", "incompleted"]);      // Mass changer button
    arrayToBoard(array);
}

// Stores current state of the inputs, to later restore using loadInputs() (inputs are deleted after 1 year)
function saveInputs(){
    setCookie("inputs", boardToString(), 365);
}

// Loads the inputs in the state it was when last saved
function loadInputs(){
    let inputs = getCookie("inputs");
    if(inputs == ""){
        console.log("No inputs are stored. Please store inputs first. If you believe you have stored inputs in the past, either you removed your cookies or the cookie expired (the cookie is deleted after 365 days)");
        return;
    }

    inputs = JSON.parse(inputs);
    inputs.push(["random", "random", "normal", "incompleted"]);      // Mass changer button
    arrayToBoard(inputs);
}

// Stores current state of the board, to later restore using loadBoard() (board is deleted after 1 year)
function saveBoard(){// Create Post Request
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "/bingo-card-to-input");

    xmlHttp.onload = function() {
        if(xmlHttp.status == 200){
            setCookie("board", xmlHttp.responseText, 365);
        }else{
            console.log("error: ", xmlHttp);
        }
    }

    // Initialize Formdata
    try{
        let card = document.getElementById("bingo-card-image").getAttribute("src");
        let fd = new FormData();
        fd.append("card", card);
        xmlHttp.send(fd);
    } catch {
        return;
    }
}

// Loads the board in the state it was when last saved
function loadBoard(){
    let inputs = getCookie("board");
    if(inputs == ""){
        console.log("No board is stored. Please store a board first. If you believe you have stored a board in the past, either you removed your cookies or the cookie expired (the cookie is deleted after 365 days)");
        return;
    }

    inputs = JSON.parse(inputs);
    inputs.push(["random", "random", "normal", "incompleted"]);      // Mass changer button
    arrayToBoard(inputs);
}