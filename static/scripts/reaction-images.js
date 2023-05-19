// Counts the requests done via the frontend interface, and passes it as a parameter to the backend.
// Backend ignores this, but it prevents browsers caching the response and giving back the same image every time
let increment = 0
let imgtype = "ANGERY"

function rerollImage(){
    div = document.getElementById("frontend-random-images");
    img = document.createElement("img");
    img.src = `/get-random-image?imgtype=${imgtype}&inc=${increment}`;

    div.innerHTML = "";     // Delete old picture
    div.appendChild(img);
    increment++;
}

window.onload = function(){
    rerollImage();
    document.getElementById("imgtype").onchange = function(){
        imgtype = this.value;
    }
}