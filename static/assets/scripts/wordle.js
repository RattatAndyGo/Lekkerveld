let rows = 6;               // Minimum amount of displayed rows
let columns = 5;            // Amount of letters in a word
let currentGuess = "";      // Current guess, possibly not fully typed yet
let answer = "blank";       // Answer of the puzzle
let guessedWords = [];      // Array of guessed words

window.onload = function(){
    draw();
}

// Keyboard listener to detect keystrokes
document.addEventListener("keydown", (e) => {processKeystroke(e.key)});

// Draws the HTML on screen
function draw(){
    
    // Guessed words
    let field_html = '';
    for(let i = 0; i < guessedWords.length; i++){
        let row_html = `<tr id="row${i}">`;
        for(let j = 0; j < columns; j++){
            row_html += `<td id="cell${i}-${j}"><p>${guessedWords[i][j].toUpperCase()}</p></td>`;
        }
        row_html += "</tr>";
        field_html += row_html;
    }

    // Input row
    let row_html = `<tr id="input-row">`;
    for(let i = 0; i < currentGuess.length && i < columns; i++){
        row_html += `<td id="input${i}">${currentGuess[i]}</td>`
    }
    for(let i = currentGuess.length; i < columns; i++){
        row_html += `<td id="input${i}"></td>`;
    }
    row_html += "</tr>";
    field_html += row_html;

    // Additional rows if needed
    for(let i = guessedWords.length; i < rows-1; i++){       // if less than 5 guesses, fill with empty guesses
        let row_html = `<tr id="row${i}">`;
        for(let j = 0; j < columns; j++){
            row_html += `<td id="cell${i}-${j}"></td>`
        }
        row_html += "</tr>";
        field_html += row_html;
    }
    document.getElementById("game_table").innerHTML = field_html;
}

function get_row_html(index){
    let row_html = "<tr>";
    for(let j = 0; j < columns; j++){
        row_html += `<td>${guessedWords[index][j]}</td>`;
    }
    row_html += "</tr>";
    return row_html;
}

// Runs every time a key is pressed, and does something depending on the key in question
function processKeystroke(key){
    key = String(key);
    if(key == "Enter"){
        guess();
        return;
    }
    if(key == "Backspace"){
        currentGuess = currentGuess.slice(0, -1);
        document.getElementById(`input${currentGuess.length}`).innerHTML = "";
        return;
    }
    if(!key.match(/[a-z]/gi) || currentGuess.length >= columns) return;

    currentGuess += key;
    document.getElementById(`input${currentGuess.length-1}`).innerHTML = `<p>${key.toUpperCase()}</p>`;
}

// Submit a word to check against the answer
function guess(){
    if(currentGuess.length < columns){
        console.log("not enough letters");
        return;
    }
    guessedWords.push(currentGuess);
    currentGuess = "";
    draw();
}

// TODO
// guessing algorithm with changing answer
// adding colors in draw()

// iterate through list, for each word:
// get the answer colors
// convert it to an int (see colors as 0 1 2, combo as ternary number)
// store word in corresponding array (using array of 243 arrays)
// once through list, select index of array with most elements (if tie use randomizer, prevents optimal strategies somewhat and keeps game fresher)
// revert to color combo
// fill in color combo
// swap list of all possible answers with winning array