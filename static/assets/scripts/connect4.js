// Constants
const bgColor = "#f6f6f6";
let pageWidth;   // Width of page content in pixels
const colors = ["#00ffff", "#ff0000", "#00ff00", "#0000ff", "#ff00aa", "#ffff00", "#aa00ff", "#ff00ff", "#8f6a23", "#23628f", "#000000", "#ffffff"]
const colorStrings = ["Empty", "Red", "Green", "Blue", "Pink", "Yellow", "Purple", "Magenta", "Brown", "Cyan", "Black", "White"];

// Game options
let winAmount = 4;     // How many consecutive coins are needed to win, static constant
let amount_of_rows = 6;
let amount_of_columns = 7;
let playerCount = 2;
let checkHz = true;
let checkVt = true;
let checkD1 = true;     // Primary diagonal \
let checkD2 = true;     // Secondary diagonal /
let torus = false;
let gravity = true;
let setRequired = true;
let setSize = 2;
let setAmount = 2;
let instability = 3;
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
    document.getElementById("portal-check").onchange = function(){
        let bool = this.checked;
        let portalDiv = document.getElementById("portal-div");
        if(bool) portalDiv.style = "display: inline-block;";
        else portalDiv.style = "display: none;";
        updatePortals(bool);
        reset_game();
        draw();
    }
    document.getElementById("set-check").onchange = function(){
        setRequired = this.checked;
        reset_game();
        draw();
    }
    document.getElementById("setSize").onchange = function(){
        setSize = this.value;
        reset_game();
        draw();
    }
    document.getElementById("setAmount").onchange = function(){
        setAmount = this.value;
        reset_game();
        draw();
    }
    document.getElementById("instability").onchange = function(){
        instability = this.value;
        reset_game();
        draw();
    }
}

// Draws the current game state on the web page
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
    let classList = "class='";
    let onclickList = "onclick='";

    if((move == row || !gravity && game_state[row][column] == 0) && !has_finished){
        classList += "highlighted "
        onclickList += `add_coin(${column}, ${row}) `
    }
    let setIndex = findSetIndex(row, column);
    if(setIndex != -1){
        classList += `portalset${setIndex} `;
    }

    cell_html = "<td " + classList + "' " + onclickList + "'></td>"
    return cell_html;
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

// Adds a coin in the given position
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

// Triggered when someone won, finishes game
function has_won(){
    has_finished = true;
    document.getElementById("notifications").innerHTML = `<p>${colorStrings[current_player]} won!</p>`;
}

function check_game_state(row, column){
    if(checkHz) check_generalized(row, column, 0, 1);       // Horizontal
    if(checkVt) check_generalized(row, column, 1, 0);       // Vertical
    if(checkD1) check_generalized(row, column, 1, 1);       // Main diagonal
    if(checkD2) check_generalized(row, column, 1, -1);      // Secondary diagonal
    check_draw(row, column);
}

// Checks if the game has ended in a draw
function check_draw(){
    if(current_turn == amount_of_rows*amount_of_columns && !has_finished){
        document.getElementById("notifications").innerHTML = "<p>The game is a draw.</p>";
        document.getElementById("player").style.backgroundColor = "#ffffff";
        has_finished = true;
    }
}

// Checks for a win in a general direction, indicated by row_increment and column_increment.
// The variables row and column indicate which cell was added, to see if it finished a 4 in a row
function check_generalized(row, column, row_increment, column_increment){
    let consecutive_coins = countOneWay(row, column, row_increment, column_increment, game_state[row][column, true]) + countOneWay(row, column, -row_increment, -column_increment, game_state[row][column], true) - 1;
    if(consecutive_coins >= winAmount){
        has_won();
    }
}

// Count the amount of consecutive coins starting from [row][column] and incrementing by the given increments.
// Negating the increments gives the other direction, the sum of these is the total number of consecutive coins + 1 (start is counted twice)
function countOneWay(row, column, row_increment, column_increment, player, usePortal){
    let count = 0;

    while(game_state[row][column] == player){
        let setIndex = findSetIndex(row, column);
        if(!setIndex == -1 && usePortal == true){
            let maxCount = 0
            for(let i = 0; i < portals[setIndex].size; i++){
                let count = countOneWay(delinearized(i)[0], delinearized(i)[1], row_increment, column_increment, player, false);
                maxCount = Math.max(count, maxCount);
            }
            return maxCount;
        }

        if(++count >= winAmount) return count;      // No matter rest of results, player has won, prevents infinite loops
        row += row_increment;
        column += column_increment;
        usePortal = true;           // Moved one step, so portals can be used again
        
        if(!in_board(row, column)){ // Fallen out of board
            if(!torus) break;       // no wrap around, so end of line
            row = mod(row, amount_of_rows);
            column = mod(column, amount_of_columns);
        }
    }

    return count;
}

// Returns the index of the portal set which contains the given cell.
// Returns -1 if the cell is not a portal
function findSetIndex(row, column){
    let cell = linearized(row, column);
    for(let i = 0; i < portals.size; i++){
        for(let j = 0; j < i.size; j++){
            if(cell == j){
                return i;
            }
        }
    }
    return -1;
}

// Returns index of cell in row-linearized array of the game board
function linearized(row, column){
    return row*amount_of_columns+column;
}

// Returns an array of the row and column value of the given cell.
// result[0] is the row index, result[1] is the column index
function delinearized(index){
    return [index/amount_of_columns.floor, mod(index, amount_of_columns)];
}

function in_board(row, column){
    return(row >= 0 && column >= 0 && row < amount_of_rows && column < amount_of_columns);
}

// Takes the modulo of two numbers a and b.
// The return value is the mathematical result of a%b
// using a%b is bugged in js, see source listed below
// https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
function mod(a, b){
    return ((a%b)+b)%b;
}

function initialize_game_variables(){
    has_finished = false;
    current_player = 1;
    current_turn = 0;
    total_seconds = 0;
    game_state = create_empty_game();
    portals = updatePortals();
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

// Adds leading zero to single digit timer values
function add_leading_zero(number){
    let res = `${number}`;
    if(res.length == 1){
        res = "0" + res;
    }
    return res;
}

// Changes board size from normal page-content width to full screen width
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

// Randomly chooses a combination of cells to be portals.
// The cell is represented by its index in a linearized verion of the game board.
// To get the coordinates, divide by amount_of_columns, result is row index and remainder is column index.
// Two portals cannot occupy the same cell, no matter if they're from the same set or not.
function updatePortals(bool){
    portals = [];
    if(!bool) return;       // If false, no portals and thus empty set

    let chosenCells = [];
    for(let i = 0; i < setAmount; i++){
        let set = [];
        for(let j = 0; j < setSize; j++){
            let cell = getRandomIntExcluded(amount_of_columns*amount_of_rows, chosenCells);
            set.push(cell);
            chosenCells.push(cell);
        }
        portals.push(set);
    }
}