// Checks if user has a username cookie and if not, creates one 
async function checkUsername() {
    if(getCookie("username") != ""){
        refreshCookie("username");
        refreshCookie("idToken");
        return
    }

    let username = prompt("Please enter your name:", "");
    while(!(/^[a-zA-Z0-9_]+$/).test(username)){
        username = prompt("Please enter your name (only alphanumerical characters and underscore are allowed):", "");
    }

    if(username == null) location.reload()  // You can bypass the prompts by pressing escape, this prevents users from not choosing a username, as nothing works without it

    let inUse = true;
    await checkForUsed(username).then(
        function(response){inUse = (response == "used");},
        function(Error){console.log(Error); return;}
    );

    if(inUse){
        let id = prompt("This username is already in use. If this is you on another device, please fill in its id token that can be found on the bottom of the page. If this is not you, leave the input blank.");
        
        let match = false;
        await checkID(username, id).then(
            function(response){match = (response == "match");},
            function(Error){console.log(Error); return;}
        );
        if(!match){
            location.reload();      // Resets questions
            return;
        }

        setCookie("username", username, 365);
        setCookie("idToken", id, 365);
        return;
    }
    
    let id = window.crypto.randomUUID().slice(-12)
    setCookie("idToken", id, 365);       // Only use 12 characters as it needs to be typeable
    setCookie("username", username, 365);
    
    insertIntoDB(id, username);
}

// Given a username, returns true if the username is already in use
function checkForUsed(username){
    return new Promise((resolve, reject) => {
        // Create Post Request
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "/username-check-for-used");

        xmlHttp.onload = function() {
            if(xmlHttp.status == 200){
                resolve(xmlHttp.response);
            }else{
                reject(Error("An error occurred: " + xmlHttp.status));
            }
        }
        xmlHttp.onerror = function () {
            reject(Error("An error occurred: " + xmlHttp.status));
        };

        // Initialize Formdata
        let fd = new FormData();
        fd.append("username", JSON.stringify(username));
        
        xmlHttp.send(fd);
    });
}

// Checks if username and id are linked
function checkID(username, id){
    return new Promise((resolve, reject) => {
        // Create Post Request
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "/username-check-id");

        xmlHttp.onload = function() {
            if(xmlHttp.status == 200){
                resolve(xmlHttp.response);
            }else{
                reject(Error("An error occurred: " + xmlHttp.status));
            }
        }
        xmlHttp.onerror = function () {
            reject(Error("An error occurred: " + xmlHttp.status));
        };

        // Initialize Formdata
        let fd = new FormData();
        fd.append("username", JSON.stringify(username));
        fd.append("id", JSON.stringify(id));
        
        xmlHttp.send(fd);
    });
}

function insertIntoDB(id, username){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "/username-add-new-user");

    let fd = new FormData();
    fd.append("username", JSON.stringify(username));
    fd.append("id", JSON.stringify(id));
    xmlHttp.send(fd);
}