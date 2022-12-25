// Constants
const bgColor = "#f6f6f6";
let pageWidth;   // Width of page content in pixels
const colors = ["#00ffff", "#ff0000", "#00ff00", "#0000ff", "#ff00aa", "#ffff00", "#aa00ff", "#ff00ff", "#8f6a23", "#23628f", "#000000", "#ffffff"]
const colorStrings = ["Empty", "Red", "Green", "Blue", "Pink", "Yellow", "Purple", "Magenta", "Brown", "Cyan", "Black", "White"];

// Game options
let winAmount = 4;     // How many consecutive coins are needed to win, static constant
let amount_of_rows = 6;
let amount_of_columns = 8;
let playerCount = 2;
let checkHz = true;
let checkVt = true;
let checkD1 = true;     // Primary diagonal \
let checkD2 = true;     // Secondary diagonal /
let torus = false;
let gravity = true;
let boardSize = 0;      // 0 == normal, 1 == larger

// Game variables
let has_finished;
let current_player;     // Index of colors array
let current_turn;       // Turn counter
let total_seconds;
let game_state;
let portals;

// Setup
initialize_game_variables();
setInterval(update_timer, 1000);

function create_empty_game(){
    let game_state = [];
    for(let i = 0; i < amount_of_rows; i++){
        let row = []
        for(let j = 0; j < amount_of_columns; j++){
            row[j] = 0;
        }
        game_state[i] = row;
    }

    return game_state;
}

// This function sets up all listeners for game option changes.
// It also initially draws the game board when loading the page,
// And calculates how wide page-content is.
window.onload = function(){
    pageWidth = document.getElementById("page-content").offsetWidth;
    draw();
    document.getElementById("amount_of_rows").onchange = function(){
        amount_of_rows = this.value;
        reset_game();
        draw();
    }
    document.getElementById("amount_of_columns").onchange = function(){
        amount_of_columns = this.value;
        reset_game();
        draw();
    }
    document.getElementById("playerCount").onchange = function(){
        playerCount = this.value;
        reset_game();
        draw();
    }
    document.getElementById("winAmount").onchange = function(){
        winAmount = this.value;
        reset_game();
        draw();
    }
    document.getElementById("horizontal-check").onchange = function(){
        checkHz = this.checked;
        reset_game();
        draw();
    }
    document.getElementById("vertical-check").onchange = function(){
        checkVt = this.checked;
        reset_game();
        draw();
    }
    document.getElementById("diagonal1-check").onchange = function(){
        checkD1 = this.checked;
        reset_game();
        draw();
    }
    document.getElementById("diagonal2-check").onchange = function(){
        checkD2 = this.checked;
        reset_game();
        draw();
    }
    document.getElementById("torus-check").onchange = function(){
        torus = this.checked;
        reset_game();
        draw();
    }
    document.getElementById("gravity-check").onchange = function(){
        gravity = this.checked;
        reset_game();
        draw();
    }
}

function draw(){
    // Create HTML
    let field_html = '';
    for(let i = 0; i < amount_of_rows; i++){
        field_html += get_row_html(i);
    }
    document.getElementById("game_table").innerHTML = field_html;

    let cellWidth = Math.max(pageWidth / amount_of_columns, 20);
    let thickness = Math.min(10, (cellWidth) / 5);
    for(let i = 0; i < amount_of_rows; i++){
        for(let j = 0; j < amount_of_columns; j++){
            let cell = document.getElementById('game_table').rows[i].cells[j];
            let style = `width: ${cellWidth}px; height: ${cellWidth}px; border-radius: ${cellWidth/2}px; background-color: ${colors[game_state[i][j]]};`;
            if(cell.classList.contains('highlighted')) style += `border: ${thickness}px solid #008000;`;
            cell.style = style;
        }
    }
}

function get_row_html(index){
    let row_html = "<tr>";
    for(let j = 0; j < amount_of_columns; j++){
        row_html += get_cell_html(index, j);
    }
    row_html += "</tr>";
    return row_html;
}

function get_cell_html(row, column){
    let move = get_first_empty_slot(column);
    if((move == row || !gravity && game_state[row][column] == 0) && !has_finished){
        return `<td class="highlighted" onclick="add_coin(${column}, ${row})"></td>`;}
    return `<td></td>`;
}

// Returns the index of the row where the next coin should go.
// Returns -1 if the column is full
function get_first_empty_slot(column){
    let row = -1;
    for(let i = amount_of_rows - 1; i >=0 ; i--){
        if(game_state[i][column] == 0){
            row = i;
            break;
        }
    }
    return row;
}

function add_coin(column, row){
    if(!has_finished){
        if(row == -1){
            return;
        }
        game_state[row][column] = current_player;
        check_game_state(row, column);
        change_active_player();
        draw();
    }
}

function change_active_player(){
    if(has_finished) return;
    current_turn++;
    current_player = (current_player)%playerCount + 1;
    let color = colors[current_player];
    document.getElementById("player").style.backgroundColor = color;
}

function has_won(){
    has_finished = true;
    document.getElementById("notifications").innerHTML = `<p>${colorStrings[current_player]} won!</p>`;
}

function check_game_state(row, column){
    if(checkHz) check_generalized(row, column, 0, 1);       // Horizontal
    if(checkVt) check_generalized(row, column, 1, 0);       // Vertical
    if(checkD1) check_generalized(row, column, 1, 1);       // Main diagonal
    if(checkD2) check_generalized(row, column, 1, -1);      // Secondary diagonal
}

function check_generalized(row, column, row_increment, column_increment){
    let count = countOneWay(row, column, row_increment, column_increment) + countOneWay(row, column, -row_increment, -column_increment) - 1;
    if(count >= winAmount){
        has_won();
    }
}

// Counts the amount of consecutive coins starting from [row][column] and incrementing with the given increments.
// Making the increments negative counts in the opposite direction, so total is sum of those +1 (start is counted twice)
function countOneWay(row, column, row_increment, column_increment){
    let count = 0;
    let player = game_state[row][column];

    while(in_board(row, column) && game_state[row][column] == player){

        // if(cell is portal){
        //      let max = 0;
        //      for all portals p in the same set{
        //          let count = countOneWay(params); prevent immediately looping, if count finds portal of set already found, a loop is made and the player wins instantly (infinity in a row)
        //          if(count > max) max = count;
        //      }
        //      return max
        // }

        count++;
        row += row_increment;
        column += column_increment;

        if(torus){
            row = mod(row, amount_of_rows);
            column = mod(column, amount_of_columns);
        }
    }
    return count;
}

function in_board(row, column){
    return(row >= 0 && column >= 0 && row < amount_of_rows && column < amount_of_columns);
}

function check_draw(){
    if(current_turn == amount_of_rows*amount_of_columns){
        document.getElementById("notifications").innerHTML = "<p>The game is a draw.</p>";
        document.getElementById("player").style.backgroundColor = "#ffffff";
        has_finished = true;
    }
}

function initialize_game_variables(){
    has_finished = false;
    current_player = 1;
    current_turn = 0;
    total_seconds = 0;
    game_state = create_empty_game();
}

function reset_game(){
    initialize_game_variables();
    draw();
    document.getElementById("notifications").innerHTML = "";
}

// Source: based on https://stackoverflow.com/questions/5517597/plain-count-up-timer-in-javascript
function update_timer(){
    if(!has_finished){
        let minutes = add_leading_zero(Math.floor(total_seconds/60));
        let seconds = add_leading_zero(total_seconds % 60);
        let time = minutes + ":" + seconds;
    
        document.getElementById("timer").innerHTML = time;
        total_seconds++;
    }
}

function add_leading_zero(number){
    let res = `${number}`;
    if(res.length == 1){
        res = "0" + res;
    }
    return res;
}

function changeBoardSize(){
    // Change dependant code
    if(boardSize == 0){     // small --> large
        document.getElementById("page-content").style = "max-width: 100vw; width: 100vw;";
        boardSize = 1;
    }else{                  // large --> small
        document.getElementById("page-content").style = "";
        boardSize = 0;
    }
    
    // Finalize new changes
    pageWidth = document.getElementById("page-content").offsetWidth;
    draw();
}

// Returns a random int between 0 and max (excluded)
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Returns a random int between 0 and max (excluded)
// Rerolls result if it is present in exclusions
// Returns -1 if all possible values are present in exclusions
function getRandomIntExcluded(max, exclusions){
    if(exclusions.size >= max) return -1;
    let r = getRandomInt(max);
    while(exclusions.contains(r)){
        r = getRandomInt(max)
    }
    return r;
}

// Takes the modulo of two numbers a and b.
// The return value is the mathematical result of a%b
// using a%b is bugged in js, see source listed below
// https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
function mod(a, b){
    return ((a%b)+b)%b;
}