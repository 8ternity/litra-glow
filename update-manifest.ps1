$json = @'
{
	"Actions": [
		{
			"Icon": "imgs/litra_glow_plus",
			"Name": "Brightness +25 lm",
			"States": [
				{
					"Image": "imgs/litra_glow_plus"
				}
			],
			"Tooltip": "Increase Litra Glow brightness by 25 lumens",
			"UUID": "com.litra.glow.v2.brightness.up"
		},
		{
			"Icon": "imgs/litra_glow_minus",
			"Name": "Brightness -25 lm",
			"States": [
				{
					"Image": "imgs/litra_glow_minus"
				}
			],
			"Tooltip": "Decrease Litra Glow brightness by 25 lumens",
			"UUID": "com.litra.glow.v2.brightness.down"
		},
		{
			"Icon": "imgs/litra_glow_cool",
			"Name": "Temperature +400 K",
			"States": [
				{
					"Image": "imgs/litra_glow_cool"
				}
			],
			"Tooltip": "Increase Litra Glow temperature by 400 K",
			"UUID": "com.litra.glow.v2.temperature.up"
		},
		{
			"Icon": "imgs/litra_glow_warm",
			"Name": "Temperature -400 K",
			"States": [
				{
					"Image": "imgs/litra_glow_warm"
				}
			],
			"Tooltip": "Decrease Litra Glow temperature by 400 K",
			"UUID": "com.litra.glow.v2.temperature.down"
		},
		{
			"Icon": "imgs/litra_glow_on",
			"Name": "Toggle Light",
			"States": [
				{
					"Image": "imgs/litra_glow_off"
				},
				{
					"Image": "imgs/litra_glow_on"
				}
			],
			"Tooltip": "Toggle Litra Glow On/Off",
			"UUID": "com.litra.glow.v2.toggle"
		}
	],
	"Author": "ET34N1TY",
	"Description": "Control your Logitech Litra Glow light from your Stream Deck",
	"Name": "Litra Glow Control",
	"Category": "Litra Glow Control",
	"CategoryIcon": "imgs/litra_glow_on",
	"Icon": "imgs/litra_glow_on",
	"URL": "https://github.com/timrogers/litra",
	"Version": "2.1.1.0",
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

try {
	# Supprimer le fichier existant
	Remove-Item -Path "com.litra.glow.v2.sdPlugin\manifest.json" -Force -ErrorAction Stop
	
	# Créer un nouveau fichier avec le contenu mis à jour
	Set-Content -Path "com.litra.glow.v2.sdPlugin\manifest.json" -Value $json -ErrorAction Stop
	
	# Vérifier que le fichier a été créé correctement
	$content = Get-Content -Path "com.litra.glow.v2.sdPlugin\manifest.json" -Raw
	if ($content -match '"Actions":') {
		Write-Host "Le fichier manifest.json a été mis à jour avec succès."
	} else {
		Write-Host "ERREUR: Le fichier manifest.json semble incorrect."
	}
} catch {
	Write-Host "ERREUR: $_"
} 