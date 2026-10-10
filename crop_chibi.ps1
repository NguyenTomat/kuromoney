Add-Type -AssemblyName System.Drawing

$src = "c:\Users\Acer\Downloads\money kepper\assets\chibi_transparent.png"
$croppedDst = "c:\Users\Acer\Downloads\money kepper\assets\chibi_cropped.png"

$bmp = [System.Drawing.Bitmap]::FromFile($src)

$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.A -gt 30) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Bounds: X($minX, $maxX), Y($minY, $maxY)"
$w = $maxX - $minX + 1
$h = $maxY - $minY + 1

if ($w -gt 50 -and $h -gt 50) {
    $rect = New-Object System.Drawing.Rectangle($minX, $minY, $w, $h)
    $cropped = $bmp.Clone($rect, $bmp.PixelFormat)
    $bmp.Dispose()
    $cropped.Save($croppedDst, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Output "Cropped chibi saved to $croppedDst (Size: $w x $h)"
} else {
    $bmp.Dispose()
}
