const savedLinksKey = "savedLinks";

function addLinkToLocalStorage(newLink) {
  let savedLinks = readLocalStorageToArray(savedLinksKey);
  if (savedLinks === null) {
    savedLinks = [newLink];
  } else if (!savedLinks.some((portal) => portal.primaryURL === newLink.primaryURL)) {
    // don't save the same link twice
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
  try {
    localStorageArray = JSON.parse(localStorage.getItem(key));
  } catch (e) {
    localStorageArray = null;
  }
  return localStorageArray;
}

function writeArrayToLocalStorage(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

// Same shortened link text as the portal pages
function shortUrlText(url) {
  let text = url.replace(/^https?:\/\//i, "");
  return text.length > 48 ? text.substring(0, 45) + "…" : text;
}

function exportSavedLinks() {
  const savedLinks = readLocalStorageToArray(savedLinksKey) || [];
  const blob = new Blob([JSON.stringify(savedLinks, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "msportals-favourites.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function importSavedLinks(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("not a list");
      imported
        .filter((portal) => portal && typeof portal.primaryURL === "string" && /^https?:\/\//i.test(portal.primaryURL) && portal.portalName)
        .forEach((portal) => {
          // only keep http(s) secondary links from an imported file
          if (Array.isArray(portal.secondaryURLs)) {
            portal.secondaryURLs = portal.secondaryURLs.filter((s) => s && typeof s.url === "string" && /^https?:\/\//i.test(s.url));
          } else {
            delete portal.secondaryURLs;
          }
          addLinkToLocalStorage(portal);
        });
      removeSavedLinksHTML();
      generateSavedLinksHTML();
    } catch (e) {
      alert("That file doesn't look like an msportals.io favourites export.");
    }
  };
  reader.readAsText(file);
}

function generateSavedLinksToolbar(entry, hasLinks) {
  const toolbar = document.createElement("div");
  toolbar.className = "favourites-toolbar";

  if (hasLinks) {
    const exportButton = document.createElement("button");
    exportButton.type = "button";
    exportButton.className = "btn";
    exportButton.textContent = "Export favourites";
    exportButton.addEventListener("click", exportSavedLinks);
    toolbar.appendChild(exportButton);
  }

  const importLabel = document.createElement("label");
  importLabel.className = "btn";
  importLabel.textContent = "Import favourites";
  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = "application/json,.json";
  importInput.className = "visually-hidden";
  importInput.addEventListener("change", () => {
    if (importInput.files.length > 0) importSavedLinks(importInput.files[0]);
  });
  importLabel.appendChild(importInput);
  toolbar.appendChild(importLabel);

  entry.appendChild(toolbar);
}

function generateSavedLinksHTML() {
  let savedLinks = readLocalStorageToArray(savedLinksKey);
  const entry = document.getElementsByClassName("entry")[0];

  if (savedLinks != null && savedLinks.length > 0) {
    generateSavedLinksToolbar(entry, true);
    let groups = new Set(savedLinks.map((i) => i.groupName));

    groups.forEach((group) => {
      let groupPortals = savedLinks.filter(
        (portal) => portal.groupName === group
      );

      let portalGroup = document.createElement("div");
      portalGroup.classList = "portal-group";
      entry.appendChild(portalGroup);

      let heading = document.createElement("h2");
      heading.innerText = groupPortals[0].groupName;
      portalGroup.appendChild(heading);

      groupPortals.forEach((portal) => {
        portalRow = document.createElement("div");
        portalRow.classList = "portal";

        portalRowName = document.createElement("span");
        portalRowName.classList = "portal-name";

        portalRemove = document.createElement("button");
        portalRemove.type = "button";
        portalRemove.classList = "portal-remove";
        portalRemove.dataset.href = portal.primaryURL;
        portalRemove.title = "Remove from favourites";
        portalRemove.setAttribute("aria-label", "Remove " + portal.portalName + " from favourites");
        portalRemove.innerText = "➖";

        portalRowName.appendChild(portalRemove);
        portalRowName.appendChild(document.createTextNode(" " + portal.portalName));

        portalRow.appendChild(portalRowName);
        portalGroup.appendChild(portalRow);

        if (portal.note) {
          portalNote = document.createElement("span");
          portalNote.classList = "portal-note";
          portalNote.textContent = " " + portal.note;
          portalRowName.appendChild(portalNote);
        }

        portalDetails = document.createElement("div");
        portalDetails.classList = "portal-details";

        portalCopy = document.createElement("button");
        portalCopy.type = "button";
        portalCopy.classList = "portal-copy";
        portalCopy.dataset.url = portal.primaryURL;
        portalCopy.title = "Copy link";
        portalCopy.setAttribute("aria-label", "Copy link to " + portal.portalName);
        portalCopy.textContent = "⧉";
        portalDetails.appendChild(portalCopy);

        portalURLSpan = document.createElement("span");
        portalURLSpan.classList = "portal-url";

        portalURL = document.createElement("a");
        portalURL.href = portal.primaryURL;
        portalURL.target = "_blank";
        portalURL.title = portal.primaryURL;
        portalURL.innerText = shortUrlText(portal.primaryURL);

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
        let removePortalURL = event.currentTarget.dataset.href;
        removeLinkFromLocalStorage(removePortalURL);
        removeSavedLinksHTML();
        generateSavedLinksHTML();
      })
    );
  } else {
    entry.innerHTML = "You haven't added any links for your favorites page.<br/>"
    entry.innerHTML += "Click the <span style='color: red;'>❤</span> next to a portal name to add some, then come back!<br/>";
    generateSavedLinksToolbar(entry, false);
  }
}

function removeSavedLinksHTML() {
  document.getElementsByClassName("entry")[0].innerHTML = "";
}
