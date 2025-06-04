Add-Type -AssemblyName System.Drawing

# Créer une fonction pour générer des images
function Create-Icon {
    param($text, $filename)
    
    $bitmap = New-Object System.Drawing.Bitmap(144, 144)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::FromArgb(64, 64, 64))
    
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $font = New-Object System.Drawing.Font('Arial', 14, [System.Drawing.FontStyle]::Bold)
    
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rect = New-Object System.Drawing.Rectangle(0, 0, 144, 144)
    $graphics.DrawString($text, $font, $brush, $rect, $stringFormat)
    
    $bitmap.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $font.Dispose()
    $stringFormat.Dispose()
}

# Créer toutes les icônes
Create-Icon "💡" "com.litra.glow.sdPlugin\imgs\toggle.png"
Create-Icon "OFF" "com.litra.glow.sdPlugin\imgs\light-off.png"
Create-Icon "ON" "com.litra.glow.sdPlugin\imgs\light-on.png"
Create-Icon "☀" "com.litra.glow.sdPlugin\imgs\brightness.png"
Create-Icon "🌡" "com.litra.glow.sdPlugin\imgs\temperature.png"
Create-Icon "LITRA" "com.litra.glow.sdPlugin\imgs\plugin-icon.png"

Write-Host "Images créées avec succès!" 