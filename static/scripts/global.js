// Function to set a cookie
// cname is the name of the cookie, cvalue is the value of the cookie, exdays is the amount of days the cookie is stored
// Source: https://www.w3schools.com/js/js_cookies.asp 
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Strict";
}

// Function to get a cookie
// cname is the name of the cookie, the result is the associated value (or empty string if cookie isn't set)
// Source: https://www.w3schools.com/js/js_cookies.asp 
function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Resets a cookie to the same value but with an updated expiry time
function refreshCookie(cname){
    setCookie(cname, getCookie(cname), 365*3);
}