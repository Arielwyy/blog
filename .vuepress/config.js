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
            //这个地方是加有大类型的doc，需要在这里注册导航
            {
                "text": "文档",
                "icon": "reco-message",
                "items": [
                    {
                        "text": "vuepress-reco",
                        "link": "/docs/theme-reco/"
                    },
                    {
                        "text": "mydoc",
                        "link": "/docs/mydoc/"
                    }
                ]
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
                "link": ""
            },
            {
                "title": "github",
                "desc": "github",
                "link": ""
            },
            {
                "title": "gitee",
                "desc": "gitee",
                "link": ""
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
