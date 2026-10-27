// Page behaviour shared by every page: mobile menu, collapsible groups, section jump menu,
// favourite and copy buttons, and the "/" shortcut for the quick filter.
(function () {
  const collapsedKey = "collapsedGroups";
  // Long groups of pages inside a portal (e.g. "Admin - Entra Admin Center Pages") start collapsed until opened
  const collapsedByDefault = /(Portal|Admin Center) Pages$/i;

  function readCollapsedState() {
    try {
      return JSON.parse(localStorage.getItem(collapsedKey)) || {};
    } catch (e) {
      return {};
    }
  }

  function writeCollapsedState(state) {
    try {
      localStorage.setItem(collapsedKey, JSON.stringify(state));
    } catch (e) {
      // storage unavailable (private mode etc.) - collapse state just won't be remembered
    }
  }

  // --- Mobile menu -------------------------------------------------------
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const open = siteNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // --- Collapsible groups (portal pages only, not the favourites page) ----
  const groups = document.getElementById("search") ? Array.from(document.querySelectorAll(".portal-group")) : [];
  const state = readCollapsedState();

  function setCollapsed(group, collapsed, remember) {
    group.classList.toggle("collapsed", collapsed);
    const toggle = group.querySelector(".group-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    if (remember) {
      state[group.dataset.groupName] = collapsed;
      writeCollapsedState(state);
    }
  }

  groups.forEach((group) => {
    const heading = group.querySelector("h2");
    if (!heading) return;
    const name = heading.textContent.trim();
    group.dataset.groupName = name;
    const count = group.querySelectorAll(".portal").length;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "group-toggle";
    toggle.setAttribute("aria-label", "Show or hide " + name);
    toggle.innerHTML = '<span class="group-toggle-icon" aria-hidden="true">▾</span>';
    heading.insertBefore(toggle, heading.firstChild);

    const countBadge = document.createElement("span");
    countBadge.className = "group-count";
    countBadge.textContent = count;
    heading.appendChild(countBadge);

    toggle.addEventListener("click", () => setCollapsed(group, !group.classList.contains("collapsed"), true));

    const remembered = state[name];
    setCollapsed(group, remembered === undefined ? collapsedByDefault.test(name) : remembered, false);
  });

  // --- Section jump menu -------------------------------------------------
  const nav = document.querySelector(".group-nav");
  const navList = nav && nav.querySelector(".group-nav-list");
  if (nav && navList && groups.length > 1) {
    groups.forEach((group) => {
      const heading = group.querySelector("h2");
      if (!heading || !heading.id) return;
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = group.dataset.groupName + " (" + group.querySelectorAll(".portal").length + ")";
      link.addEventListener("click", () => setCollapsed(group, false, true));
      item.appendChild(link);
      item.dataset.groupName = group.dataset.groupName;
      navList.appendChild(item);
    });
    nav.querySelector("summary").textContent = "Jump to a section (" + navList.children.length + ")";
    nav.hidden = false;

    nav.querySelector(".group-expand-all").addEventListener("click", () => groups.forEach((g) => setCollapsed(g, false, true)));
    nav.querySelector(".group-collapse-all").addEventListener("click", () => groups.forEach((g) => setCollapsed(g, true, true)));

    // Keep the menu in step with the quick filter: only list sections that have matches
    document.addEventListener("portals-filtered", () => {
      const visible = new Set(groups.filter((g) => !g.hidden).map((g) => g.dataset.groupName));
      Array.from(navList.children).forEach((li) => (li.hidden = !visible.has(li.dataset.groupName)));
    });
  }

  // Opening a link to a section (e.g. msportals.io/admin#admin-entra-quick-links) expands it
  if (window.location.hash) {
    const target = document.getElementById(window.location.hash.substring(1));
    const group = target && target.closest(".portal-group");
    if (group) setCollapsed(group, false, false);
  }

  // --- Favourite buttons -------------------------------------------------
  function flash(button, text) {
    const original = button.textContent;
    button.textContent = text;
    button.classList.add("done");
    setTimeout(() => {
      button.textContent = original;
      button.classList.remove("done");
    }, 1200);
  }

  document.querySelectorAll(".portal-add").forEach((button) => {
    button.addEventListener("click", () => {
      try {
        const [g, i] = button.dataset.g.split(".").map(Number);
        const group = window.msPortalData[button.dataset.s][g - 1];
        const link = Object.assign({}, group.portals[i - 1], { groupName: group.groupName });
        addLinkToLocalStorage(link);
        flash(button, "✓");
      } catch (e) {
        flash(button, "!");
      }
    });
  });

  // --- Copy-link buttons ---------------------------------------------------
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "absolute";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
    return Promise.resolve();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".portal-copy");
    if (!button) return;
    // favourites page buttons carry the URL; portal pages use the row's link
    const link = button.closest(".portal").querySelector(".portal-url a");
    copyText(button.dataset.url || (link && link.href)).then(
      () => flash(button, "✓"),
      () => flash(button, "!")
    );
  });

  // --- "/" focuses the quick filter ---------------------------------------
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) return;
    const search = document.getElementById("search");
    if (search) {
      event.preventDefault();
      search.focus();
      search.select();
    }
  });
})();