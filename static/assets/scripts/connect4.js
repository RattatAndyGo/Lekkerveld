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
let setSize = 2;
let setAmount = 2;
let instability = 3;
let turnsUntilPortalShift;
let boardSize = 0;      // 0 == normal, 1 == larger

// Game variables
let has_finished;
let current_player;     // Index of colors array
let current_turn;       // Turn counter
let total_seconds;
let game_state;
let portals;

function create_empty_board(){
    board = [];
    for(let i = 0; i < amount_of_rows; i++){
        let row = []
        for(let j = 0; j < amount_of_columns; j++){
            row[j] = 0;
        }
        board[i] = row;
    }
    return board;
}

// This function sets up all listeners for game option changes.
// It also sets up initial conditions.
window.onload = function(){
    pageWidth = document.getElementById("page-content").offsetWidth;
    initialize_game_variables();
    setInterval(update_timer, 1000);
    draw();

    document.getElementById("amount_of_rows").onchange = function(){
        amount_of_rows = this.value;
        reset_game();
    }
    document.getElementById("amount_of_columns").onchange = function(){
        amount_of_columns = this.value;
        reset_game();
    }
    document.getElementById("playerCount").onchange = function(){
        playerCount = this.value;
        reset_game();
    }
    document.getElementById("winAmount").onchange = function(){
        winAmount = this.value;
        reset_game();
    }
    document.getElementById("horizontal-check").onchange = function(){
        checkHz = this.checked;
        reset_game();
    }
    document.getElementById("vertical-check").onchange = function(){
        checkVt = this.checked;
        reset_game();
    }
    document.getElementById("diagonal1-check").onchange = function(){
        checkD1 = this.checked;
        reset_game();
    }
    document.getElementById("diagonal2-check").onchange = function(){
        checkD2 = this.checked;
        reset_game();
    }
    document.getElementById("torus-check").onchange = function(){
        torus = this.checked;
        reset_game();
    }
    document.getElementById("gravity-check").onchange = function(){
        gravity = this.checked;
        reset_game();
    }
    document.getElementById("portal-check").onchange = function(){
        if(this.checked) document.getElementById("portal-div").style = "display: inline-block";
        else document.getElementById("portal-div").style = "display: none";
        reset_game();
    }
    document.getElementById("setSize").onchange = function(){
        setSize = this.value;
        reset_game();
    }
    document.getElementById("setAmount").onchange = function(){
        setAmount = this.value;
        reset_game();
    }
    document.getElementById("instability").onchange = function(){
        instability = this.value;
        reset_game();
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
    let cell_html = "<td";

    let move = get_first_empty_slot(column);
    if((move == row || !gravity && game_state[row][column] == 0) && !has_finished){
        cell_html += ` class="highlighted" onclick="add_coin(${column}, ${row})"`;
    }
    cell_html += ">";

    let index = portals[row][column];
    if(index != 0){
        cell_html += `<p>${index}</p>`;
    }

    cell_html += "</td>";
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

function add_coin(column, row){
    game_state[row][column] = current_player;
    check_game_state(row, column);
    change_active_player();
    draw();
}

function change_active_player(){
    if(has_finished) return;
    current_turn++;
    current_player = (current_player)%playerCount + 1;
    if(current_player == 1){
        if(--turnsUntilPortalShift == 0){
            turnsUntilPortalShift = instability;
            notify("The portals are shifting...");
            updatePortals();
            checkAllCells();
        }
    }
    let color = colors[current_player];
    document.getElementById("player").style.backgroundColor = color;
}

function has_won(){
    has_finished = true;
    notify(colorStrings[current_player] + " won!");
}

// Iterates around the board and checks each cell for a win as if it had just been placed.
// Very inefficient, so only call when really needed
function checkAllCells(){
    for(let i = 0; i < amount_of_rows; i++){
        for(let j = 0; j < amount_of_columns; j++){
            check_game_state(i, j);
        }
    }
}

function check_game_state(row, column){
    if(checkHz) check_generalized(row, column, 0, 1);       // Horizontal
    if(checkVt) check_generalized(row, column, 1, 0);       // Vertical
    if(checkD1) check_generalized(row, column, 1, 1);       // Main diagonal
    if(checkD2) check_generalized(row, column, 1, -1);      // Secondary diagonal
}

function check_generalized(row, column, row_increment, column_increment){
    let count = countOneWay(row, column, row_increment, column_increment, game_state[row][column], []) + countOneWay(row, column, -row_increment, -column_increment, game_state[row][column], []) - 1;
    if(count >= winAmount){
        has_won();
    }
}

// Counts the amount of consecutive coins starting from [row][column] and incrementing with the given increments.
// Making the increments negative counts in the opposite direction, so total is sum of those +1 (start is counted twice)
function countOneWay(row, column, row_increment, column_increment, player, visitedSets){
    if(!in_board(row, column)){
        if(!torus) return 0;
        row = mod(row, amount_of_rows);
        column = mod(column, amount_of_columns);
    }

    let count = 0;

    while(in_board(row, column) && game_state[row][column] == player){
        count++;

        let set = portals[row][column];
        if(visitedSets.includes(set)) return winAmount;     // Looping, so infinity in a row

        if(set != 0){
            let max = 0;
            for(let i = 0; i < amount_of_rows; i++){
                for(let j = 0; j < amount_of_columns; j++){
                    if(portals[i][j] != set || game_state[i][j] != player) continue;

                    // Count from the cell next to the portal, to prevent looping. Two portals count as one cell, so no cell is uncounted.
                    let c = countOneWay(i+row_increment, j+column_increment, row_increment, column_increment, player, visitedSets + set);
                    if(c > max) max = c;
                }
            }
            return max+count;     // Best result from portal hopping + previously counted coins 
        }

        row += row_increment;
        column += column_increment;

        if(!torus) continue;
        row = mod(row, amount_of_rows);
        column = mod(column, amount_of_columns);
    }
    return count;
}

function in_board(row, column){
    return(row >= 0 && column >= 0 && row < amount_of_rows && column < amount_of_columns);
}

function check_draw(){
    if(current_turn == amount_of_rows*amount_of_columns){
        notify("The game is a draw.");
        document.getElementById("player").style.backgroundColor = "#ffffff";
        has_finished = true;
    }
}

// This generates random sets of portals depending on the current game variables,
// And stores it in the variable portals as an array of arrays, where each cell is represented by its linearized index
function updatePortals(){
    portals = create_empty_board();
    if(!document.getElementById("portal-check").checked) return;        // Portals are disabled, so need empty set

    for(let i = 0; i < setAmount; i++){
        for(let j = 0; j < setSize; j++){
            cell = getPortallessCell();
            portals[cell[0]][cell[1]] = i+1;
        }
    }
}

// Returns a random cell that isn't a portal
function getPortallessCell(){
    let cell = getRandomCell();
    while(portals[cell[0]][cell[1]] != 0){
        cell = getRandomCell();
    }
    return cell;
}

function initialize_game_variables(){
    has_finished = false;
    current_player = 1;
    current_turn = 0;
    total_seconds = 0;
    turnsUntilPortalShift = instability;
    game_state = create_empty_board();
    updatePortals();
}

function reset_game(){
    if(!checkViability()) return;
    initialize_game_variables();
    draw();
    notify("");
}

function checkViability(){
    let portal = (setAmount*setSize) <= (amount_of_columns*amount_of_rows);     // Are there more portals than cells?
    let size = amount_of_columns >= winAmount || amount_of_rows >= winAmount || torus || document.getElementById("portal-check").checked;       // Is it possible to get a long enough chain?
    let winDirection = checkHz || checkVt || checkD1 || checkD2;        // Is there a direction in which you can win?
    let viable = portal && size && winDirection;        // combine booleans
    if(!viable) notify("Your current settings create an impossible board (e.g. you have more portals than available cells). Please change them.");
    return viable;
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

function notify(string){
    document.getElementById("notifications").innerHTML = `<p>${string}<p>`;
}

// Returns a random int between 0 and max (excluded)
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Returns a random int between 0 and max (excluded)
// Rerolls result if it is present in exclusions
// Returns -1 if all possible values are present in exclusions
function getRandomIntExcluded(max, exclusions){
    if(exclusions.length >= max) return -1;
    let r = getRandomInt(max);
    while(exclusions.includes(r)){
        r = getRandomInt(max)
    }
    return r;
}

// Returns a random cell from the board
function getRandomCell(){
    let row = getRandomInt(amount_of_rows);
    let column = getRandomInt(amount_of_columns);
    return [row, column];
}

// Returns a random cell from the board
// Rerolls result if the cell is in exclusions
// Returns an empty array if all cells are excluded
function getRandomCellExcluded(exclusions){
    if(exclusions.length >= amount_of_columns*amount_of_rows) return [];
    let cell = getRandomCell();
    while(exclusions.includes(cell)){
        cell = getRandomCell();
    }
    return cell;
}

// Takes the modulo of two numbers a and b.
// The return value is the mathematical result of a%b
// using a%b is bugged in js, see source listed below
// https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
function mod(a, b){
    return ((a%b)+b)%b;
}