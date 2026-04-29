$env:Path = "C:\Program Files\nodejs;" + $env:Path
Write-Host "Seeding database..."
npx prisma db seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "Seed successful!"
}
else {
    Write-Host "Seed failed!"
}
