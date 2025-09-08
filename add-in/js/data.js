'use strict';

const msportalsIO = {};

msportalsIO.getJSON = async function() {
	let json = null;
	const CACHE_KEY = 'msportals-data-cache';
	const CACHE_TIMESTAMP_KEY = 'msportals-data-timestamp';
	const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
	
	// Check cache first
	try {
		const cachedData = localStorage.getItem(CACHE_KEY);
		const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
		
		if (cachedData && cacheTimestamp) {
			const now = Date.now();
			const timestamp = parseInt(cacheTimestamp);
			
			if (now - timestamp < CACHE_DURATION) {
				console.log('Loading from cache');
				return JSON.parse(cachedData);
			}
		}
	} catch (e) {
		console.warn('Cache read failed:', e);
	}
	
	const urls = [
		'https://raw.githubusercontent.com/adamfowlerit/msportals.io/master/_data/portals/admin.json',
		'https://raw.githubusercontent.com/adamfowlerit/msportals.io/master/_data/portals/user.json',
		'https://raw.githubusercontent.com/adamfowlerit/msportals.io/master/_data/portals/thirdparty.json'
	];
	
	console.log('Loading from network...');
	
	const requests = urls.map( 
		url => fetch(url, {
			cache: 'force-cache', // Use browser cache when available
			headers: {
				'Cache-Control': 'max-age=300' // 5 minutes
			}
		})
		.then( 
			response => {
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
				return response.json();
			}
		)
		.catch( 
			err => {
				console.trace(err);
				return null; // Return null for failed requests
			} 
		));
		
		try {
			const results = await Promise.allSettled(requests);
			
			json = (results)
			.filter( r => r.status === 'fulfilled' && r.value !== null)
			.map(r => r.value)
			.flat();
			
			// Cache the successful result
			if (json && json.length > 0) {
				try {
					localStorage.setItem(CACHE_KEY, JSON.stringify(json));
					localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
				} catch (e) {
					console.warn('Cache write failed:', e);
				}
			}
		}
		catch (err) {
			console.error('getJSON(): unknown error occurred.')
			console.trace(err)
		}
		
		return json;
}

function convertToHTML(object) {
	console.log(object);
	
	if (object.every(value => value === undefined)) { return }
	
	// Use DocumentFragment for better performance
	const fragment = document.createDocumentFragment();
	
	function createLink(href, innerText) {
		let link = document.createElement('a');        
		link.setAttribute("target", "_blank");
		link.setAttribute("rel", "noopener noreferrer");
		
		link.href = href;
		link.innerText = innerText;
		
		return link;
	}
	
	function createDetails(classStr) {
		let details = document.createElement("details");
		details.setAttribute('class', classStr);
		
		return details;
	}
	
	function createSpan(innerHTML, className, id) {
		let span = document.createElement("span");
		span.setAttribute('class', className);
		span.innerHTML = innerHTML;
		
		if (id) {
			span.setAttribute('id', id);
		}
		
		return span;
	}
	
	function createSummary(portalName, note, id, favorite) {
		let summary = document.createElement("summary");
		
		if (favorite) {
			let portalNameSpan = createSpan(portalName, "portal-name");
			
			let portalAddSpan = createSpan("❤ ", "portal-add", id);
			portalNameSpan.prepend(portalAddSpan);
			
			summary.appendChild(portalNameSpan);
		} 
		else { 			
			summary.innerHTML = portalName;
			
			if (note) {
				summary.innerHTML = portalName + ' ' + note;
			}
		}
		
		return summary;
	}
	
	
	let groupidx = 0;	
	let html = [];
	
	// Batch DOM operations for better performance
	// if object length is 0, then this loop does not process
	// uncommend line below to observe
	// object = [];	
	for (const msportals of object) {
		//console.log(msportals);
		groupidx += 1;
		let portalGroup = createDetails('portal-group');
		
		let groupName = createSummary(msportals.groupName);
		portalGroup.appendChild(groupName);
		
		// Create a document fragment for portals to batch DOM operations
		const portalFragment = document.createDocumentFragment();
		
		let portalsidx = 0;
		for (const portals of msportals.portals) {
			//console.log(portals);
			portalsidx += 1;
			let id = groupidx + '.' + portalsidx;
			let portal = createDetails('portal');
			
			let portalName = createSummary(portals.portalName, portals.note, id, true);
			portal.appendChild(portalName);
			
			let linkcontainer = document.createElement("ul");
			portal.appendChild(linkcontainer);
			
			// Create primary link
			let listItem = document.createElement('li');
			let link = createLink(portals.primaryURL, portals.primaryURL);
			listItem.appendChild(link);
			linkcontainer.appendChild(listItem);
			
			// Create secondary links if any
			if (portals.secondaryURLs) {
				for (const secondaryURL of portals.secondaryURLs) {
					let listItem = document.createElement('li');
					let link = createLink(secondaryURL.url, secondaryURL.url);
					listItem.appendChild(link);
					linkcontainer.appendChild(listItem);
				}
			}
			
			portalFragment.appendChild(portal);
		}
		
		// Append all portals at once
		portalGroup.appendChild(portalFragment);
		html.push(portalGroup);
	}
	
	return html;
}

function appendToDocument(html, htmlNode) {
	for (const htmlChunk of html) {
		htmlNode.append(htmlChunk);
	}
}

function show() {
	const id = this.text
	
	console.log(id);
	
	if (! (id === 'Home')) {
		document.getElementById('Home').style.display = "none"
	}
	
	if (id === 'Favorites') {
		generateSavedLinksHTML();
	}
	
	let root = document.getElementById('root')
	let newContent = document.getElementById(id)
	
	root.innerHTML = newContent.innerHTML
	
	return false
}


// implement favorites.js
const savedLinksKey = "savedLinks";


function addLinkToLocalStorage(newLink) {
	//console.log(newLink);
	let savedLinks = readLocalStorageToArray(savedLinksKey);
	
	if (savedLinks === null) {
		savedLinks = [newLink];
	} 
	else {
		savedLinks.push(newLink);
	}
	
	writeArrayToLocalStorage(savedLinksKey, savedLinks);
}

function removeLinkFromLocalStorage(link) {
	let currentLinks = readLocalStorageToArray(savedLinksKey);
	
	let newLinks = currentLinks.filter((portal) => {
		return portal.primaryURL != link;
	});
	
	writeArrayToLocalStorage(savedLinksKey, newLinks);
}

function readLocalStorageToArray(key) {
	let localStorageArray = JSON.parse(localStorage.getItem(key));
	
	return localStorageArray;
}

function writeArrayToLocalStorage(key, arr) {
	localStorage.setItem(key, JSON.stringify(arr));
}

function generateSavedLinksHTML() {
	let savedLinks = readLocalStorageToArray(savedLinksKey);
	
	if (savedLinks != null && savedLinks.length > 0) {
		// select Favorites div entry
		let divFav = document.getElementById("Favorites")
		let favEntry = divFav.children[0].children[0].children[1]
		
		while (favEntry.firstChild) {
			console.log(favEntry.firstChild)
			favEntry.removeChild(favEntry.firstChild)
		}
		
		// groupBy function, accepts array and key
		const groupBy = (array, key) => {
			// Return the end result
			return array.reduce((result, currentValue) => {
				// If an array already present for key, push it to the array. Else create an array and push the object
				(result[currentValue[key]] = result[currentValue[key]] || []).push(
					currentValue
				);
				// Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
				return result;
			}, {}); // empty object is the initial value for result object
		};
		
		// Group by groupName as key to the savedLinks array
		const group = groupBy(savedLinks, 'groupName');
		
		let json = [];
		
		// convert array back to original json formatting
		Object.entries(group).map(([key, value]) => {
			let g = {};
			g.groupName = '';
			g.portals = '';
			g.groupName = key;
			g.portals = value;
			
			json.push(g);
		});
		
		let html = convertToHTML(json);
		
		appendToDocument(html,favEntry);
	}
}

function removeSavedLinksHTML() {
	document.getElementsByClassName("entry")[0].innerHTML = "";
}

function addFavoriteEventListeners(object) {
	let data = object;
	let portals = [].concat(...[...data.map(i => { return i.portals })]);
	let portalAdds = document.getElementsByClassName("portal-add");
	
	Array.from(portalAdds).forEach(fav => {
		fav.addEventListener("click", (event) => {
			let arrayLocation = event.target.id.split(".").map(i => i - 1)
			//console.log(arrayLocation);
			let newLink = data[arrayLocation[0]].portals[arrayLocation[1]];
			newLink.groupName = data[arrayLocation[0]].groupName;
			//console.log(newLink)
			addLinkToLocalStorage(newLink)
		}) 
	})
}
// favorites.js end

{
	console.log('starting.');
	const mainContainer = document.getElementById('msportalsIO links');
	
	// Show loading indicator
	const loadingIndicator = document.querySelector('.loading');
	if (loadingIndicator) {
		loadingIndicator.style.display = 'block';
		loadingIndicator.textContent = 'Loading portal data...';
	}
	
	// Add performance timing
	const startTime = performance.now();
	
	msportalsIO.getJSON()
	.then(json => {
		if (loadingIndicator) {
			loadingIndicator.textContent = 'Rendering portals...';
		}
		
		// Use requestAnimationFrame for smooth rendering
		requestAnimationFrame(() => {
			let html = convertToHTML(json);
			appendToDocument(html, mainContainer);
			
			addFavoriteEventListeners(json);
			
			// Initialize search cache after DOM is ready
			if (typeof initializeSearchCache === 'function') {
				initializeSearchCache();
			}
			
			const loadTime = performance.now() - startTime;
			console.log(`Portal data loaded and rendered in ${loadTime.toFixed(2)}ms`);
		});
	})
	.catch(err => {
		console.trace(err);
		if (loadingIndicator) {
			loadingIndicator.textContent = 'Error loading portal data. Please refresh the page.';
			loadingIndicator.style.color = 'red';
		}
	})
	.finally(() => {
		// dont allow search form to submit, eg. 'enter' on keyboard after typing query
		document.forms[0].onsubmit = () => {return false}
		
		// hide progress bar
		setTimeout(() => {
			if (loadingIndicator) {
				loadingIndicator.style.display = 'none';
			}
		}, 100); // Small delay to ensure smooth transition
		
		// show loaded data
		document.getElementById('Home').style.display = "block";
		
		// update link behavior
		document.getElementById('linkHome').addEventListener("click", show)
		document.getElementById('linkFav').addEventListener("click", show)
		document.getElementById('linkAbout').addEventListener("click", show)
		
		console.log('done.')
	});
}								
