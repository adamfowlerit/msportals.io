"use strict";

console.clear();


async function digestMessage(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest('SHA-256', data);
	
    return btoa(String.fromCharCode.apply(null, new Uint8Array(hash)));
}

// make sure url is loaded before use
async function getJson(url) {
    const response = await fetch(url);
    const content = await response.json();
	
    return content;
}

// combine async functions in a nice promise pattern
// added caching - https://aws.amazon.com/caching/best-practices/
async function getMSPortals() {
    const urls = [
        'https://raw.githubusercontent.com/adamfowlerit/msportals.io/master/_data/portals/admin.json',
        'https://raw.githubusercontent.com/adamfowlerit/msportals.io/master/_data/portals/user.json',
        'https://raw.githubusercontent.com/adamfowlerit/msportals.io/master/_data/portals/thirdparty.json'
    ];
    
    let msportals = localStorage.getItem('msportalsJSON');
    
    if (msportals === null) {
        console.log('localstorage empty. fetch jsons online');
        
        let jsons = [];
        for (const url of urls) {
            const data = getJson(url);
            jsons.push(data);
        }
        
        msportals = (await Promise.all(jsons)).flat();
		
		const msportalsStr = JSON.stringify(msportals);
        localStorage.setItem('msportalsJSON', msportalsStr);
        
        // save sha256 to later compare
        let sha256 = await digestMessage(msportalsStr);
    }
    else {
        // if local cache exist, return msportals
		console.log('returning cached version.')
        msportals = JSON.parse(msportals);
        
        // compare local sha256 to online
        // if different save online version to cache
    }
    
    return msportals;
}



function printHTML(object) {
    const mainContainer = document.getElementById('set');
    
    for (const msportals of object) {
        //console.log(msportals);
        let portalGroup = document.createElement("details");
        portalGroup.setAttribute('class', 'portal-group');
        mainContainer.append(portalGroup);
        
        let groupName = document.createElement("summary");
        groupName.innerHTML = msportals.groupName;
        portalGroup.appendChild(groupName);
        
        for (const portals of msportals.portals) {
            //console.log(portals);
            let portal = document.createElement("details");
            portal.setAttribute('class', 'portal');
            portalGroup.appendChild(portal);
            
            let portalName = document.createElement("summary");
            const strPortalNote = portals.note ? ' ' + portals.note : '';
            portalName.innerHTML = portals.portalName + strPortalNote;
            portal.appendChild(portalName);
            
            let linkcontainer = document.createElement("ul");
            portal.appendChild(linkcontainer);
            
            let listItem = document.createElement('li');
            linkcontainer.appendChild(listItem);
            
            let link = document.createElement('a');
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
            
            // set link as primaryURL
            link.href = portals.primaryURL;
            link.innerText = portals.primaryURL;
            listItem.appendChild(link);
            
            // print portal secondaryURLs if any
            if (portals.secondaryURLs) {
                for (const secondaryURL of portals.secondaryURLs) {
                    let listItem = document.createElement('li');
                    linkcontainer.appendChild(listItem);
                    
                    let link = document.createElement('a');
                    link.setAttribute("target", "_blank");
                    link.setAttribute("rel", "noopener noreferrer");
                    
                    // set link as secondaryURL
                    link.href = secondaryURL.url;
                    link.innerText = secondaryURL.url;
                    listItem.appendChild(link);
                }
            }
        }
    }
}

const msportals = getMSPortals();
const loadingEl = document.querySelector('.loading');

msportals
    .then(msportals => {
        loadingEl.style.display = 'none';
        // if results then format
        printHTML(msportals);
})
    .catch(e => {
        // if no results from either cache or fetch online
        console.log('error fetching jsons online and from cache');
        loadingEl.style.display = 'none';
});

