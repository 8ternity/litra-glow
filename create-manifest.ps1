$json = @'
{
    "Actions": [
        {
            "Icon": "imgs/toggle",
            "Name": "Toggle Light",
            "States": [
                {
                    "Image": "imgs/light-off"
                },
                {
                    "Image": "imgs/light-on"
                }
            ],
            "Tooltip": "Turn Litra Glow on/off",
            "UUID": "com.litra.glow.v2.toggle"
        },
        {
            "Icon": "imgs/brightness-up",
            "Name": "Brightness +25 lm",
            "States": [
                {
                    "Image": "imgs/brightness-up"
                }
            ],
            "Tooltip": "Increase Litra Glow brightness by 25 lumens",
            "UUID": "com.litra.glow.v2.brightness.up"
        },
        {
            "Icon": "imgs/brightness-down",
            "Name": "Brightness -25 lm",
            "States": [
                {
                    "Image": "imgs/brightness-down"
                }
            ],
            "Tooltip": "Decrease Litra Glow brightness by 25 lumens",
            "UUID": "com.litra.glow.v2.brightness.down"
        },
        {
            "Icon": "imgs/temperature",
            "Name": "Set Temperature",
            "States": [
                {
                    "Image": "imgs/temperature"
                }
            ],
            "Tooltip": "Set Litra Glow color temperature",
            "UUID": "com.litra.glow.v2.temperature",
            "PropertyInspectorPath": "ui/temperature.html"
        },
        {
            "Icon": "imgs/temperature-up",
            "Name": "Temperature +200 K",
            "States": [
                {
                    "Image": "imgs/temperature-up"
                }
            ],
            "Tooltip": "Increase Litra Glow temperature by 200 K",
            "UUID": "com.litra.glow.v2.temperature.up"
        },
        {
            "Icon": "imgs/temperature-down",
            "Name": "Temperature -200 K",
            "States": [
                {
                    "Image": "imgs/temperature-down"
                }
            ],
            "Tooltip": "Decrease Litra Glow temperature by 200 K",
            "UUID": "com.litra.glow.v2.temperature.down"
        }
    ],
    "Author": "ET34N1TY",
    "Description": "Control your Logitech Litra Glow light from your Stream Deck",
    "Name": "Litra Glow Control",
    "Category": "Litra Glow Control",
    "CategoryIcon": "imgs/plugin-icon",
    "Icon": "imgs/plugin-icon",
    "URL": "https://github.com/timrogers/litra",
    "Version": "2.1.0.0",
    "OS": [
        {
            "Platform": "mac",
            "MinimumVersion": "10.14"
        },
        {
            "Platform": "windows",
            "MinimumVersion": "10"
        }
    ],
    "Software": {
        "MinimumVersion": "6.4"
    },
    "SDKVersion": 2,
    "CodePath": "bin/plugin.bat",
    "UUID": "com.litra.glow.v2"
}
'@

Set-Content -Path "com.litra.glow.v2.sdPlugin\manifest.json" -Value $json 