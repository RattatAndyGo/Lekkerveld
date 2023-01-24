let rows = 6;               // Amount of displayed rows
let columns = 5;            // Amount of letters in a word
let guessedWords = [];      // Array of guessed words
let answer = "blank";       // Answer of the puzzle

window.onload = function(){
    draw();

    document.addEventListener("keydown", processKeystroke());
}

// draws the HTML on screen
function draw(){
    // game board
    let field_html = '';
    for(let i = 0; i < rows; i++){
        let row_html = "<tr>";
        for(let j = 0; j < guessedWords.length; j++){
            row_html += `<td>${guessedWords[i][j]}</td>`;
        }
        // current typed guess
        for(let j = guessedWords.length; j < columns; j++){       // if less than 5 guesses, fill with empty guesses
            row_html += "<td></td>";
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
function processKeystroke(){

}