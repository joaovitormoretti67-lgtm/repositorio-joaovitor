# download-images.ps1
# Script PowerShell para baixar imagens usadas no site para a pasta assets/
# Execute a partir da raiz do projeto (onde está index.html)

$assets = "assets"
if (-not (Test-Path $assets)) { New-Item -ItemType Directory -Path $assets | Out-Null }

$files = @(
    @{ url = 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Vincent_van_Gogh_1887.jpg'; out = "$assets/van_gogh_portrait.jpg" },
    @{ url = 'https://upload.wikimedia.org/wikipedia/commons/5/57/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'; out = "$assets/starry_night.jpg" },
    @{ url = 'https://upload.wikimedia.org/wikipedia/commons/4/45/Vincent_Willem_van_Gogh_-_Les_Tournesols_-_Google_Art_Project.jpg'; out = "$assets/sunflowers.jpg" },
    @{ url = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Vincent_Willem_van_Gogh_-_The_Potato_Eaters_-_Google_Art_Project.jpg'; out = "$assets/potato_eaters.jpg" },
    @{ url = 'https://upload.wikimedia.org/wikipedia/commons/0/05/Vincent_van_Gogh_-_Almond_Blossom.jpg'; out = "$assets/almond_blossom.jpg" },
    @{ url = 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Field_with_Cypresses_-_Van_Gogh.jpg'; out = "$assets/field_with_cypresses.jpg" }
)

# Cabeçalhos para simular um navegador comum (alguns servidores rejeitam pedidos sem UA)
$headers = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' }

function Try-Download($url, $out){
    $maxAttempts = 3
    for($i=1; $i -le $maxAttempts; $i++){
        try{
            Write-Host ("Tentativa {0}: Baixando {1} -> {2}" -f $i, $url, $out)
            # Primeiro método: Invoke-WebRequest com cabeçalho
            Invoke-WebRequest -Uri $url -OutFile $out -Headers $headers -ErrorAction Stop
            Write-Host ("Baixado: {0}" -f $out)
            return $true
        } catch {
            Write-Host ("Erro na tentativa {0}: {1}" -f $i, $_.Exception.Message) -ForegroundColor Yellow
            Start-Sleep -Seconds (2 * $i)
            # se for a última tentativa, tentar Start-BitsTransfer (mais tolerante em alguns ambientes)
            if($i -eq $maxAttempts){
                try{
                    if (Get-Command -Name Start-BitsTransfer -ErrorAction SilentlyContinue){
                        Write-Host "Tentando Start-BitsTransfer como fallback..."
                        Start-BitsTransfer -Source $url -Destination $out
                        Write-Host "Baixado via BITS: $out"
                        return $true
                    }
                } catch {
                    Write-Host "BITS fallback falhou: $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
        }
    }
    return $false
}

foreach ($f in $files) {
    $url = $f.url
    $out = $f.out
    if (Test-Path $out) {
        Write-Host "Pulando $out (já existe)"
        continue
    }
    $ok = Try-Download $url $out
    if(-not $ok){
        Write-Host "Falha ao baixar $url após tentativas. Forneça manualmente: $url -> $out" -ForegroundColor Red
    }
}

Write-Host "Processo finalizado. Verifique a pasta 'assets' e recarregue a página no navegador."