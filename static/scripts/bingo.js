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

function requestBingoCard(){
    pokemonList = [];
    document.querySelectorAll(".input-td").forEach((e) => {
        pokemon = new Square();
        e.querySelectorAll("select").forEach((f) => {
            pokemon[f.name] = f.value;
        })
        pokemonList.push(pokemon);
    })

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