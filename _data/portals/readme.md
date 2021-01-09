# JSON Sources #

 ![Validate Portal JSONs](https://github.com/adamfowlerit/msportals.io/workflows/Validate%20Portal%20JSONs/badge.svg)

We are currently making our web-pages from JSON files, our current JSON Portal sources are below.

## Website Page to JSON Mapping ##

| Website Page                                              | JSON Source                                            |
|---------------------------------------------------------- |------------------------------------------------------- |
| [Home page / Admin Links](https://msportals.io/)         | [Home page / Admin JSON](./_data/portals/admin.json)   |
| [3rd Party Links](https://msportals.io/3rdparty)         | [3rd Party JSON](./_data/portals/thirdparty.json)      |
| [US Government Links](https://msportals.io/usgovt)       | [US Government JSON](./_data/portals/us-govt.json)     |
| [End User Links/Apps](https://msportals.io/userportals)  | [End User JSON](./_data/portals/user.json)             |

## Fields ##

| Field          | Required  |
|--------------- |---------- |
| portalName     | Yes       |
| primaryURL     | Yes       |
| secondaryURLs  | No        |
| note           | No        |

### Secondary URLs ###

Secondary URLs is an array of icon/emoji/text and URL pairs. Each separate icon/text will be created as a link with the URL.

### Notes ###

On some of the portals, we have been adding notes. For example:

Example: Using the notes to make old product name searchable for Defender products.
![Defender for Endpoint is shown with "previously Defender ATP"](https://i.imgur.com/t8by69w.png)

Example: The new versus old Exchange Portals shown below.  
![Website has two Exchange Admin Centers with the New and Old portals noted](https://i.imgur.com/mjX0gS7.png)

## Example Portal Configuration ##

```json
    {
    "portalName": "Microsoft Defender for Endpoints",
    "primaryURL": "https://securitycenter.windows.com",
    "secondaryURLs": [
          {
          "icon": "aka.ms",
          "url": "https://aka.ms/MDATPportal"
          }
        ],
    "note": "Previously Defender ATP"
    },
```

## Additional context ##

Suggestions or context for the portals? If you are not certain about how to configure this, you may wish to create a [New Issue](https://github.com/adamfowlerit/msportals.io/issues/new/choose) instead.
