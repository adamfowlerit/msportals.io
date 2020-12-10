---
layout: page
title: Personal Links
---

## Personal links

<div id="personalPortals"></div>


<script type="text/javascript">

    console.log("we live")
    let personalLinks = readLocalStorageToArray(personalLinksKey)

    //document.getElementById("personalPortals").innerHTML = personalLinks.join("<br>")

    personalLinks.forEach(portal => {
        document.getElementById("personalPortals").innerHTML+=(portal.portalName + " - " + "<a href='"+portal.primaryURL+"'>Link</a><br/>")
    })



</script>