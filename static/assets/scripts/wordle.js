let rows = 6;               // Amount of displayed rows
let columns = 5;            // Amount of letters in a word
let currentGuess = "";      // Current guess, possibly not fully typed yet
let answer = "blank";       // Answer of the puzzle
let guessedWords = ["tired", "added"];      // Array of guessed words

window.onload = function(){
    draw();
}

// Keyboard listener to detect keystrokes
document.addEventListener("keyup", (e) => {processKeystroke(e.key)});

// draws the HTML on screen
function draw(){
    // game board
    let field_html = '';
    for(let i = 0; i < guessedWords.length; i++){
        let row_html = "<tr>";
        for(let j = 0; j < columns; j++){
            row_html += `<td id="cell${i}-${j}"><p>${guessedWords[i][j].toUpperCase()}</p></td>`;
        }
        row_html += "</tr>";
        field_html += row_html;
    }
    for(let i = guessedWords.length; i < rows; i++){       // if less than 5 guesses, fill with empty guesses
        let row_html = '<tr>';
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
    if(key == "Enter") guess();
    if(key == "Backspace") currentGuess = currentGuess.slice(0, currentGuess.length - 2);
    if(key != RegExp){
        return;
    }
    // code
}

// Submit a word to check against the answer
function guess(){

}