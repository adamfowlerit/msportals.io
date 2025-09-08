// Initialize fuzzy search for add-in
let fuzzySearchInstance = null;
let portalElements = [];

function initializeFuzzySearchAddin() {
	// Build searchable data from DOM elements
	portalElements = Array.from(document.querySelectorAll("details[class='portal-group'] details[class='portal']"));
	
	const searchData = portalElements.map((portalEntry, index) => {
		// Build searchable string that includes all text and link href data
		let searchableString = portalEntry.innerText;
		searchableString += Array.from(portalEntry.getElementsByTagName("a"))
			.map((e) => e.href)
			.join(" ");
		
		// Clean up, remove http(s) and newlines
		searchableString = searchableString
			.replace(/(https|http):\/\//gi, "")
			.replace(/\n/g, " ")
			.replace(/\s+/g, " ")
			.trim();

		return {
			index: index,
			content: searchableString,
			element: portalEntry
		};
	});

	// Configure fuzzy search options
	const fuzzyOptions = {
		keys: ['content'],
		threshold: 0.6 // Lower = more strict, Higher = more fuzzy
	};

	fuzzySearchInstance = new SimpleFuzzySearch(searchData, fuzzyOptions);
}

function showOnlyMatchedPortals(event) {
	query = this.value;

	// Initialize fuzzy search if not already done
	if (!fuzzySearchInstance && window.SimpleFuzzySearch) {
		initializeFuzzySearchAddin();
	}

	if (query.length >= 2 && fuzzySearchInstance) {
		// Use fuzzy search to find matches
		const searchResults = fuzzySearchInstance.search(query);
		const matchedIndices = new Set(searchResults.map(result => result.item.index));

		// Hide/show portal entries based on fuzzy search results
		portalElements.forEach((portalEntry, index) => {
			const isMatch = matchedIndices.has(index);
			
			Array.from(portalEntry.getElementsByTagName("*")).forEach((elem) => {
				elem.hidden = !isMatch;
			});
		});
	} else {
		// Show all portals when query is too short or fuzzy search not available
		Array.from(document.querySelectorAll("details[class='portal-group'] details[class='portal']")).forEach((portalEntry) => {
			Array.from(portalEntry.getElementsByTagName("*")).forEach((elem) => {
				elem.hidden = false;
			});
		});
	}

	//Iterate through Portal-groups, and check each portal entries underneath and check if all child portal are hidden
	Array.from(document.querySelectorAll("details[class='portal-group']")).forEach((portalGroup) => {
		let num = Array.from(portalGroup.querySelectorAll(".portal *")).reduce(
			//Count how many elements are not-hidden (shown)
			(total, elem) => total + (elem.hidden === false ? 1 : 0),
			0
		);
		//If all elements are hidden, hide the entire portal-group
		if (num === 0) {
			portalGroup.hidden = true;
			portalGroup.open = false;

			// hide the child portals
			Array.from(document.querySelectorAll("details[class='portal']")).forEach((portal) => {
				if (portal.hidden === true) {

					portal.open = false;
				}
			})
		} else {
			//If some portal elements are shown, be certain to show the parent portal-group
			portalGroup.hidden = false;
			portalGroup.open = true;

			// open the child portal
			Array.from(document.querySelectorAll("details[class='portal']")).forEach((portal) => {
				if (portal.hidden === false) {

					portal.open = true;
				}
			});
		}
	});

	// Display message if no portals are found
	totalNum = Array.from(document.querySelectorAll("details[class='portal-group']")).reduce((total, portalGroup) => total + (portalGroup.hidden === false ? 1 : 0), 0);

	if (totalNum === 0 || query.length === 0) {
		document.getElementsByClassName("nomatches")[0].style = "display: none;";
		document.querySelectorAll("details[class='portal-group']").forEach((portalGroup) => {
			portalGroup.open = false;
		});
		document.querySelectorAll("details[class='portal']").forEach((portal) => {
			portal.open = false;
		});
	} else {
		document.getElementsByClassName("nomatches")[0].style = "display: none;";
	}
}


window.onload = function() {
	// Select Search Box Element
	const qfInput = document.querySelector("#search");

	// Fill Search Box with URL Search value
	let theURL = new URL("https://dummy.com");
	// create dummy url
	theURL.search = window.location.search.substring(1);
	// copy current search-parameters without the '#' AS search-parameters
	qfInput.value = theURL.searchParams.get("search");

	// Add Event Listeners for changes (After we set the search box value)
	qfInput.addEventListener("keyup", showOnlyMatchedPortals);

	// Initialize fuzzy search when SimpleFuzzySearch is available
	if (window.SimpleFuzzySearch) {
		initializeFuzzySearchAddin();
	}

	qfInput.focus({
		preventScroll: true,
	});
};