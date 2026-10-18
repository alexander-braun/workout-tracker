
$dockerDesktop = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"

function Test-DockerReady {
    docker info *> $null
    return $LASTEXITCODE -eq 0
}

if (-not (Test-DockerReady)) {
    Write-Host "Starting Docker Desktop..."

    if (-not (Test-Path $dockerDesktop)) {
        throw "Docker Desktop executable not found."
    }

    Start-Process -FilePath $dockerDesktop

    $deadline = (Get-Date).AddMinutes(3)

    while (-not (Test-DockerReady)) {
        if ((Get-Date) -ge $deadline) {
            throw "Docker did not become ready within 3 minutes."
        }

        Start-Sleep -Seconds 2
    }
}

Write-Host "Docker is ready. Running backend tests..."

Push-Location "$PSScriptRoot\..\backend"

try {
    & cmd.exe /d /c ".\mvnw.cmd test -Dspring.profiles.active=local"
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
