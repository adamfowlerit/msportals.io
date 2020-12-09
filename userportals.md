---
layout: page
title: End User Portals
---

Welcome to this community driven project to list all of Microsoft's portals in one place.
The 🔁 icon is an aka.ms link - a Microsoft owned domain used for shortlinks.
The 🏢 icon is for Azure Government cloud links - usually ending in '.us'.

{% for group in site.data.portals.user %}

<div class="portal-group">
    <h2>{{ group.groupName }}</h2>
    {% for portal in group.portals %}
    <div class="portal">
        <span class="portal-name">{{portal.portalName}}
        {% if portal.note %}
            <span class="portal-note">{{ portal.note }}</span>
        {% endif %}    
        </span>
        <div class="portal-details">
        <span class="portal-url">
            <a href="{{portal.primaryURL}}" target="blank">{{portal.primaryURL}}</a> 
        </span>
                    {% if portal.secondaryURLs %}
                    <span class="portal-secondary-urls">
                    &ensp;• {% for secondary in portal.secondaryURLs %}<a href="{{secondary.url}}" target="_blank">{{secondary.icon}}</a>&thinsp;{% endfor %}
                     </span>
                {% endif %}
                </div>
    </div>
    {% endfor %}
</div>

{% endfor %}