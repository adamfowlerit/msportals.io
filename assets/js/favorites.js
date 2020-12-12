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

    groups.forEach((group) => {
      let groupPortals = savedLinks.filter(
        (portal) => portal.groupName === group
      );

      let portalGroup = document.createElement("div");
      portalGroup.classList = "portal-group";
      document.getElementsByClassName("entry")[0].appendChild(portalGroup);

      let heading = document.createElement("h2");
      heading.innerText = groupPortals[0].groupName;
      portalGroup.appendChild(heading);

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
        portalGroup.appendChild(portalRow);

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
        portalURL.innerText = portal.primaryURL;

        portalURLSpan.appendChild(portalURL);
        portalDetails.appendChild(portalURLSpan);

        if (portal.secondaryURLs) {
          portalSecondaryURLs = document.createElement("span");
          portalSecondaryURLs.classList = "portal-secondary-urls";
          portalSecondaryURLs.innerHTML = "&ensp;• ";

          portal.secondaryURLs.forEach((url) => {
            secondaryURL = document.createElement("a");
            secondaryURL.href = url.url;
            secondaryURL.target = "_blank";
            secondaryURL.innerText = url.icon;
            portalSecondaryURLs.appendChild(secondaryURL);
          });

          portalDetails.appendChild(portalSecondaryURLs);
        }

        portalRow.appendChild(portalDetails);
      });
    });

    Array.from(document.getElementsByClassName("portal-remove")).forEach((e) =>
      e.addEventListener("click", (event) => {
        let removePortalURL = event.target.dataset.href;
        removeLinkFromLocalStorage(removePortalURL);
        removeSavedLinksHTML();
        generateSavedLinksHTML();
      })
    );
  } else {
    document.getElementsByClassName("entry")[0].innerHTML = "You haven't added any links for your favorites page.<br/>"
    document.getElementsByClassName("entry")[0].innerHTML += "Click the <span style='color: red;'>❤</span> when you hover over a portal name to add some, then come back!<br/>";
  }
}

function removeSavedLinksHTML() {
  document.getElementsByClassName("entry")[0].innerHTML = "";
}
