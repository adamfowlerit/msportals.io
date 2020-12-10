console.log("We live from import")

const personalLinksKey = "personalLinks";

function addLinkToLocalStorage(newLink) {

    console.log(newLink);
    let personalLinks = readLocalStorageToArray(personalLinksKey)
    if (personalLinks === null) {
        personalLinks = [newLink]
    } else {
        personalLinks.push(newLink)
    }

    writeArrayToLocalStorage(personalLinksKey,personalLinks)

}

function removeLinkFromLocalStorage(link) {

}

function readLocalStorageToArray(key) {
    localStorageArray = JSON.parse(localStorage.getItem(key));
    return localStorageArray
}

function writeArrayToLocalStorage(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
}

/*
let test = {
    "portalName" : "",
    "primaryURL" : "https://partner.microsoft.com/dashboard/"
}


let testStr = '{"portalName":"Microsoft Call Quality Dashboard","primaryURL":"https://partner.microsoft.com/dashboard/"}'
let test2Str = '{"portalName":"Stream Admin Center","primaryURL":"https://test.com/"}'

let arr = [testStr,testStr]

*/