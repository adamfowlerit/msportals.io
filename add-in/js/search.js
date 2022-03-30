function showOnlyMatchedPortals(event) {
	query = this.value;

	Array.from(document.querySelectorAll("details[class='portal-group'] details[class='portal']")).forEach((portalEntry) => {
		// Remove individual portal entries
		if (query.length >= 2) {
			// build string that includes all text and link href data
			let searchableString = portalEntry.innerText;
			searchableString += Array.from(portalEntry.getElementsByTagName("a"))
				.map((e) => {
					return e.href;
				})
				.join("|");
			// clean up, remove http(s) and newlines
			searchableString = searchableString
				.replace(/(https|http):\/\//gi, "")
				.replace(/\n/g, "|")
				.toUpperCase();
			if (searchableString.indexOf(query.toUpperCase()) === -1) {
				//Iterate through all children, even nested children
				Array.from(portalEntry.getElementsByTagName("*")).forEach((elem) => {
					elem.hidden = true;
				});
			} else {
				Array.from(portalEntry.getElementsByTagName("*")).forEach((elem) => {
					elem.hidden = false;
				});
			}
		} else {
			//Iterate through portal entries un-hiding them in case they were hidden
			Array.from(document.querySelectorAll("details[class='portal-group'] details[class='portal']")).forEach((portalEntry) => {
				Array.from(portalEntry.getElementsByTagName("*")).forEach((elem) => {
					elem.hidden = false;
				});
			});
		}
	});

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

	qfInput.focus({
		preventScroll: true,
	});
};