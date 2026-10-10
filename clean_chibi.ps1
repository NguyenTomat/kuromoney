Add-Type -AssemblyName System.Drawing

$src = "c:\Users\Acer\Downloads\money kepper\assets\media_1791597008805.png"
$dst = "c:\Users\Acer\Downloads\money kepper\assets\chibi_clean.png"

$bmp = [System.Drawing.Bitmap]::FromFile($src)
$out = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height)

# Tách nền bằng thuật toán Color Distance so với màu nền pastel pink góc trên ($bmp[10, 10])
# Màu nền thực tế đo được quanh vùng x:10, y:10 là R:255, G:198, B:219
for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $p = $bmp.GetPixel($x, $y)
        $r = $p.R
        $g = $p.G
        $b = $p.B

        # Tính khoảng cách màu tới màu hồng nền
        # Nền: R > 200, G trong khoảng 160-220, B trong khoảng 185-235, và (R - G) nằm trong 30-80
        $diffPink = [Math]::Abs($r - 250) + [Math]::Abs($g - 190) + [Math]::Abs($b - 215)

        # Kiểm tra nếu là pixel thuộc nhân vật:
        # Nhân vật có màu đen tím đậm (R,G,B đều thấp < 100), hoặc vàng rực (sao R>240, G>200, B<100), hoặc trắng (mặt R,G,B đều > 230 và diff rất nhỏ), hoặc tím/xanh sọc váy
        $isDarkHat = ($r -lt 95 -and $g -lt 95 -and $b -lt 115)
        $isYellowStar = ($r -gt 210 -and $g -gt 160 -and $b -lt 120)
        $isWhiteFace = ($r -gt 220 -and $g -gt 210 -and $b -gt 220 -and [Math]::Abs($r - $b) -lt 25)
        $isSkirtOrBody = ($y -gt 600 -and $y -lt 920 -and $x -gt 100 -and $x -gt 150)
        
        $isBg = ($diffPink -lt 65) -or ($r -gt 235 -and $g -gt 170 -and $b -gt 195 -and ($r - $g) -gt 35 -and ($r - $b) -lt 55)

        if ($isBg -and -not $isDarkHat -and -not $isYellowStar) {
            # Trong suốt hoàn toàn
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $out.SetPixel($x, $y, $p)
        }
    }
}

# Auto crop
$minX = $out.Width; $maxX = 0; $minY = $out.Height; $maxY = 0
for ($y = 0; $y -lt $out.Height; $y++) {
    for ($x = 0; $x -lt $out.Width; $x++) {
        if ($out.GetPixel($x, $y).A -gt 20) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$w = $maxX - $minX + 1
$h = $maxY - $minY + 1
$rect = New-Object System.Drawing.Rectangle($minX, $minY, $w, $h)
$cropped = $out.Clone($rect, $out.PixelFormat)

$bmp.Dispose()
$out.Dispose()
$cropped.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()
Write-Output "Clean 3D Chibi saved ($w x $h)"
