# PowerShell script: descarga fuentes Inter y Montserrat (.woff2), genera fonts.css y empaqueta en ZIP
# Úsalo en Windows PowerShell (no requiere dependencias externas salvo curl.exe y Compress-Archive)

# Configuración
$interWeights = @("400", "500", "700")
$montserratWeights = @("400", "700")
$interVersion = "v12"
$montserratVersion = "v25"
$interBase = "https://fonts.gstatic.com/s/inter"
$montserratBase = "https://fonts.gstatic.com/s/montserrat"
$outDir = "fonts"
$cssFile = "fonts.css"
$zipFile = "fonts-local.zip"

# Crear carpeta fonts si no existe
if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

# Descargar Inter
foreach ($weight in $interWeights) {
    switch ($weight) {
        "400" { $style = "regular" }
        "500" { $style = "500" }
        "700" { $style = "700" }
    }
    $file = "inter-$interVersion-latin-$style.woff2"
    $url = "$interBase/$style/$interVersion/$file"
    Write-Host "Descargando $file"
    curl.exe -L $url -o "$outDir\$file"
}

# Descargar Montserrat
foreach ($weight in $montserratWeights) {
    switch ($weight) {
        "400" { $style = "regular" }
        "700" { $style = "700" }
    }
    $file = "montserrat-$montserratVersion-latin-$style.woff2"
    $url = "$montserratBase/$style/$montserratVersion/$file"
    Write-Host "Descargando $file"
    curl.exe -L $url -o "$outDir\$file"
}

# Crear fonts.css
@"
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter-$interVersion-latin-regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/inter-$interVersion-latin-500.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/inter-$interVersion-latin-700.woff2') format('woff2');
}
@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/montserrat-$montserratVersion-latin-regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/montserrat-$montserratVersion-latin-700.woff2') format('woff2');
}
"@ | Set-Content $cssFile

# Crear el ZIP
Compress-Archive -Path $outDir, $cssFile -DestinationPath $zipFile -Force

Write-Host "`n¡Listo! El paquete $zipFile contiene /fonts/*.woff2 y $cssFile"