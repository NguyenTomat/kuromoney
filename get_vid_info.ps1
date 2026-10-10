$shell = New-Object -COMObject Shell.Application
$folder = $shell.Namespace('c:\Users\Acer\Downloads\money kepper\assets')
$file = $folder.ParseName('kuromi.mp4')
0..40 | ForEach-Object { 
    $name = $folder.GetDetailsOf($null, $_)
    $val = $folder.GetDetailsOf($file, $_)
    if ($val) { Write-Output "$name : $val" }
}
