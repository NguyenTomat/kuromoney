Add-Type -AssemblyName System.Drawing

$src = "c:\Users\Acer\Downloads\money kepper\assets\media_1791597008805.png"
$dst = "c:\Users\Acer\Downloads\money kepper\assets\chibi_transparent.png"

if (Test-Path $src) {
    $bmp = [System.Drawing.Bitmap]::FromFile($src)
    $cutout = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height)

    # Let's crop to just the character bounding area to make it nimble
    # Character in media_1791597008805.png:
    # Width x Height: check dimensions
    Write-Output "Image dimensions: $($bmp.Width) x $($bmp.Height)"

    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            $r = $p.R
            $g = $p.G
            $b = $p.B

            # Background in media_1791597008805.png is pastel pink:
            # R is high (~240-255), G is around 170-205, B is around 195-225
            # Character has black ears/hat, white face/body, purple dress, yellow star
            $isPinkBg = ($r -gt 210 -and $g -gt 155 -and $b -gt 180 -and ($r - $g) -gt 25) -or
                        ($r -gt 230 -and $g -gt 175 -and $b -gt 200)

            # Keep pixels of character
            if ($isPinkBg -and ($y -lt ($bmp.Height * 0.45) -or $x -lt ($bmp.Width * 0.15) -or $x -gt ($bmp.Width * 0.85) -or $y -gt ($bmp.Height * 0.88))) {
                $cutout.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } else {
                $cutout.SetPixel($x, $y, $p)
            }
        }
    }

    $cutout.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $cutout.Dispose()
    Write-Output "Successfully saved $dst"
}
