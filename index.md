---
layout: page
title: All MS Portals
search: true
---
Welcome to this community driven project to list all of Microsoft's portals (and some third party portals) in one place. [Submit an issue](https://github.com/adamfowlerit/msportals.io/issues) for any amendments to these links. The home page (what you're looking at now) contains a list of all URLs from all sections

{% comment %} dedupe=true shows each URL once on this page (first group wins). US Gov is left out so its GCC / GCC High groups stay complete. {% endcomment %}
{% assign shown_urls = '|' %}
{% include portal.html portal="admin" skip_group="Admin - Microsoft Trials" dedupe=true %}
{% include portal.html portal="ai" dedupe=true %}
{% include portal.html portal="user" dedupe=true %}
{% include portal.html portal="edu" dedupe=true %}
{% include portal.html portal="licensing" dedupe=true %}
{% include portal.html portal="us-govt" %}
{% include portal.html portal="china" dedupe=true %}
{% include portal.html portal="training" dedupe=true %}
{% include portal.html portal="consumer" dedupe=true %}
{% include portal.html portal="admin" only_group="Admin - Microsoft Trials" dedupe=true %}
{% include portal.html portal="thirdparty" dedupe=true %}
The ![aka.ms button](.\images\akamsicon.png) icon is an aka.ms link - a Microsoft owned domain used for shortlinks.
