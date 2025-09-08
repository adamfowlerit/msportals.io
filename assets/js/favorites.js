const savedLinksKey = "savedLinks";

function addLinkToLocalStorage(newLink) {
  let savedLinks = readLocalStorageToArray(savedLinksKey);
  if (savedLinks === null) {
    savedLinks = [newLink];
  } else {
    savedLinks.push(newLink);
  }

  writeArrayToLocalStorage(savedLinksKey, savedLinks);
}

function removeLinkFromLocalStorage(link) {
  currentLinks = readLocalStorageToArray(savedLinksKey);
  newLinks = currentLinks.filter((portal) => {
    return portal.primaryURL != link;
  });
  writeArrayToLocalStorage(savedLinksKey, newLinks);
}

function readLocalStorageToArray(key) {
  localStorageArray = JSON.parse(localStorage.getItem(key));
  return localStorageArray;
}

function writeArrayToLocalStorage(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

function generateSavedLinksHTML() {
  let savedLinks = readLocalStorageToArray(savedLinksKey);

  if (savedLinks != null && savedLinks.length > 0) {
    let groups = new Set(savedLinks.map((i) => i.groupName));

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    groups.forEach((group) => {
      let groupPortals = savedLinks.filter(
        (portal) => portal.groupName === group
      );

      let portalGroup = document.createElement("div");
      portalGroup.classList = "portal-group";

      let heading = document.createElement("h2");
      heading.innerText = groupPortals[0].groupName;
      portalGroup.appendChild(heading);

      // Use fragment for batch portal creation
      const portalsFragment = document.createDocumentFragment();

      groupPortals.forEach((portal) => {
        portalRow = document.createElement("div");
        portalRow.classList = "portal";

        portalRowName = document.createElement("span");
        portalRowName.classList = "portal-name";

        portalRemove = document.createElement("span");
        portalRemove.classList = "portal-remove";
        portalRemove.dataset.href = portal.primaryURL;
        portalRemove.innerText = "➖ ";

        portalRowName.appendChild(portalRemove);
        portalRowName.innerHTML += portal.portalName;

        portalRow.appendChild(portalRowName);

        if (portal.note) {
          portalNote = document.createElement("span");
          portalNote.classList = "portal-note";
          portalNote.innerHTML = "&ensp;" + portal.note;
          portalRowName.appendChild(portalNote);
        }

        portalDetails = document.createElement("div");
        portalDetails.classList = "portal-details";

        portalURLSpan = document.createElement("span");
        portalURLSpan.classList = "portal-url";

        portalURL = document.createElement("a");
        portalURL.href = portal.primaryURL;
        portalURL.target = "_blank";
        portalURL.rel = "noopener noreferrer";
        portalURL.innerText = portal.primaryURL;

        portalURLSpan.appendChild(portalURL);
        portalDetails.appendChild(portalURLSpan);

        if (portal.secondaryURLs) {
          portalSecondaryURLs = document.createElement("span");
          portalSecondaryURLs.classList = "portal-secondary-urls";
          portalSecondaryURLs.innerHTML = "&ensp;• ";

          portal.secondaryURLs.forEach((url) => {
            secondaryURL = document.createElement("a");
            secondaryURL.classList.add("btn-secondary", "btn");
            secondaryURL.href = url.url;
            secondaryURL.target = "_blank";
            secondaryURL.rel = "noopener noreferrer";
            secondaryURL.innerText = url.icon;
            portalSecondaryURLs.appendChild(secondaryURL);
          });

          portalDetails.appendChild(portalSecondaryURLs);
        }

        portalRow.appendChild(portalDetails);
        portalsFragment.appendChild(portalRow);
      });

      portalGroup.appendChild(portalsFragment);
      fragment.appendChild(portalGroup);
    });

    // Single DOM update
    document.getElementsByClassName("entry")[0].appendChild(fragment);

    // Add event listeners efficiently using requestAnimationFrame
    requestAnimationFrame(() => {
      Array.from(document.getElementsByClassName("portal-remove")).forEach((e) =>
        e.addEventListener("click", (event) => {
          let removePortalURL = event.target.dataset.href;
          removeLinkFromLocalStorage(removePortalURL);
          removeSavedLinksHTML();
          generateSavedLinksHTML();
        })
      );
    });
  } else {
    document.getElementsByClassName("entry")[0].innerHTML = "You haven't added any links for your favorites page.<br/>"
    document.getElementsByClassName("entry")[0].innerHTML += "Click the <span style='color: red;'>❤</span> when you hover over a portal name to add some, then come back!<br/>";
  }
}

function removeSavedLinksHTML() {
  document.getElementsByClassName("entry")[0].innerHTML = "";
}
