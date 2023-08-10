window.addEventListener("load", function() {
    checkUsername();
});

// Checks if user has a username cookie and if not, creates one 
function checkUsername() {
    if(getCookie("username") != ""){
        refreshCookie("username");
        refreshCookie("idToken");
    }else{
        changePageContent();
    }
}

function changePageContent(){
    document.getElementById("page-content").innerHTML = `<h1>Select username</h1>
                                                        <p>This page is used to pick a username. Once you have done so, you will return to the page you were trying to visit.
                                                        More info about how we use cookies can be found <a href="/cookies">here</a></p>
                                                        <p>Insert your username here:</p>
                                                        <input type="text" id="username-input" name="username"></input>
                                                        <p>In case you want to use the same username as another device, enter their id here:</p>
                                                        <input type="text" id="id-input" name="id"></input>
                                                        <button onclick=createUsername()>Submit</button>
                                                        <div id="response"></div>

                                                        <style>
                                                        input{
                                                            padding: 0.75rem;
                                                            border-radius: 1rem;
                                                            margin-bottom: 0.75rem;
                                                            font-size: 1rem;
                                                            width: 15rem;
                                                          }
                                                        </style>
                                                        `;
}

async function createUsername(){
    let username = document.getElementById("username-input").value;
    let id = document.getElementById("id-input").value;

    if(!(/^[a-zA-Z0-9_]+$/).test(username)){
        document.getElementById("response").innerHTML = "<p>Username can only use alphanumerical characters and underscore.</p>";
        return;
    }

    let inUse = true;
    await checkForUsed(username).then(
        function(response){inUse = (response == "used");},
        function(Error){console.log(Error); return;}
    );

    if(inUse){
        let match = false;
        await checkID(username, id).then(
            function(response){match = (response == "match");},
            function(Error){console.log(Error); return;}
        );
        if(!match){
            document.getElementById("response").innerHTML = "<p>Username and id don't match. Please try again.</p>";
            return;
        }

        setCookie("username", username, 365);
        setCookie("idToken", id, 365);
        location.reload();
        return;
    }

    if(id != ""){
        document.getElementById("response").innerHTML = "<p>Username is new, but an id was supplied. Please check for spelling mistakes or delete the id.</p>";
        return;
    }
    
    id = window.crypto.randomUUID().slice(-12);
    setCookie("idToken", id, 365);       // Only use 12 characters as it needs to be typeable
    setCookie("username", username, 365);
    
    insertIntoDB(id, username);
    location.reload();
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