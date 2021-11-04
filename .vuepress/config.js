module.exports = {
    "title": "Ariel_wyy",
    "description": "blog",
    "dest": "public",
    "base": "/blog/",
    "head": [
        [
            "link",
            {
                "rel": "icon",
                "href": "/favicon.ico"
            }
        ],
        [
            "meta",
            {
                "name": "viewport",
                "content": "width=device-width,initial-scale=1,user-scalable=no"
            }
        ]
    ],
    "theme": "reco",
    "themeConfig": {
        "nav": [
            {
                "text": "主页",
                "link": "/",
                "icon": "reco-home"
            },
            {
                "text": "TimeLine",
                "link": "/timeline/",
                "icon": "reco-date"
            },
            {
                "text": "Contact",
                "icon": "reco-message",
                "items": [
                    {
                        "text": "GitHub",
                        "link": "https://github.com/recoluan",
                        "icon": "reco-github"
                    }
                ]
            }
        ],
        "sidebar": {
            "/docs/theme-reco/": [
                "",
                "theme",
                "plugin",
                "api"
            ]
        },
        "type": "blog",
        "blogConfig": {
            "category": {
                "location": 2,
                "text": "博客"
            },
            "tag": {
                "location": 5,
                "text": "标签"
            }
        },
        "friendLink": [
            {
                "title": "Ariel_wyy",
                "desc": "made it",
                "email": "chenforcode@stu.pku.edu.cn",
                "link": "http://www.chenforcode.cn"
            },
            {
                "title": "github",
                "desc": "github",
                "link": "https://github.com/ChenforCode"
            },
            {
                "title": "gitee",
                "desc": "gitee",
                "link": "https://gitee.com/chenforcode"
            }
        ],
        "logo": "/logo.png",
        "search": true,
        "searchMaxSuggestions": 10,
        "lastUpdated": "Last Updated",
        "author": "ariel_wyy",
        "authorAvatar": "/avatar.png",
        "record": "xxxx",
        "startYear": "2019"
    },
    "markdown": {
        "lineNumbers": true
    }
}
