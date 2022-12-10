let bgColor = "#f6f6f6";
let notificationDiv = document.getElementById("notifications");

let win_amount = 4;     // How many consecutive coins are needed to win, static constant
let amount_of_rows = 6;
let amount_of_columns = 8;

let has_finished;
let current_player;   // Yellow == 0; Red == 1
let current_turn;       // Turn counter
let total_seconds;
let game_state;
initialize_game_variables();

setInterval(update_timer, 1000);

function create_empty_game(){
    let game_state = [];
    for(let i = 0; i < amount_of_rows; i++){
        let row = []
        for(let j = 0; j < amount_of_columns; j++){
            row[j] = -1;
        }
        game_state[i] = row;
    }
    return game_state;
}

window.onload = function(){
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
}

function draw(){
    draw_field();
    draw_buttons();
}

function draw_buttons(){
    let button_html = "";
    for(let i = 0; i < amount_of_columns; i++){
        button_html += `<button onclick="add_coin(${i})"></button>`;
    }
    document.getElementById("buttons").innerHTML = button_html;
}

function draw_field(){
    let field_html = '';
    for(let i = 0; i < amount_of_rows; i++){
        field_html += get_row_html(i);
    }
    document.getElementById("game_table").innerHTML = field_html;
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
    let number = game_state[row][column];
    let type = "";
    switch(number){
        case -1: type = "emptycell"; break;
        case 0: type = "yellowcell"; break;
        case 1: type = "redcell"; break;
        default: type = "emptycell"; break;     // Bug prevention, should never be reached
    }

    let cell_html = `<td class = "${type}"></td>`;
    return cell_html;
}

function add_coin(column){
    if(!has_finished){
        let row = get_first_empty_slot(column);
        if(row == -1){
            return;
        }
        game_state[row][column] = current_player;
        change_active_player();
        check_game_state(row, column);
        draw();
    }
}

function change_active_player(){
    current_turn++;
    current_player = 1 - current_player;
    let color = "";
    switch(current_player){
        case 0: color = "#ffff00"; break;
        case 1: color = "#ff0000"; break;
        default: color = "#000000"; break;      // Bug prevention, should never be reached
    }
    document.getElementById("player").style.backgroundColor = color;
}

// Returns the index of the row where the next coin should go.
// Returns -1 if the column is full
function get_first_empty_slot(column){
    let row = -1;
    for(let i = amount_of_rows - 1; i >=0 ; i--){
        if(game_state[i][column] == -1){
            row = i;
            break;
        }
    }
    return row;
}

function has_won(){
    switch(current_player){
        case 1: notificationDiv.innerHTML = "<p>Yellow won!</p>"; break;        // Numbers swapped because game already changed active player
        case 0: notificationDiv.innerHTML = "<p>Red won!</p>"; break; 
        default: notificationDiv.innerHTML = "<p>An unknown error occurred (a third player seems to have won.)</p>"; break;
    }
    has_finished = true;
    document.getElementById("player").style.backgroundColor = bgColor;
}

function check_game_state(row, column){
    check_horizontal(row, column);
    check_vertical(row, column);
    check_main_diagonal(row, column);
    check_secondary_diagonal(row, column);
    check_draw(row, column);
}

function check_generalized(row, column, row_increment, column_increment){
    let consecutive_coins = 0;
    let player = game_state[row][column];

    while(in_board(row, column) && game_state[row][column] == player){
        row -= row_increment;
        column -= column_increment;
    }
    row += row_increment;
    column += column_increment;    // Now row/column is index of start of line

    while(in_board(row, column) && game_state[row][column] == player){
        row += row_increment;
        column += column_increment;
        consecutive_coins++;
    }

    if(consecutive_coins >= win_amount){
        has_won();
    }
}

function in_board(row, column){
    return(row >= 0 && column >= 0 && row < amount_of_rows && column < amount_of_columns);
}

function check_horizontal(row, column){
    check_generalized(row, column, 0, 1);
}

function check_vertical(row, column){
    check_generalized(row, column, 1, 0);
}

function check_main_diagonal(row, column){
    check_generalized(row, column, 1,1);
}

function check_secondary_diagonal(row, column){
    check_generalized(row, column, 1, -1);
}

function check_draw(){
    if(current_turn == amount_of_rows*amount_of_columns){
        notificationDiv.innerHTML = "<p>The game is a draw.</p>";
        document.getElementById("player").style.backgroundColor = "#ffffff";
        has_finished = true;
    }
}

function initialize_game_variables(){
    has_finished = false;
    current_player = 0;
    current_turn = 0;
    total_seconds = 0;
    game_state = create_empty_game();
}

function reset_game(){
    initialize_game_variables();
    draw();
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