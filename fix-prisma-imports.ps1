# PowerShell script to replace PrismaClient imports
# Run this in the project root directory

$files = @(
    "app\api\categories\route.ts",
    "app\api\companies\route.ts",
    "app\api\leaves\route.ts",
    "app\api\products\route.ts",
    "app\api\roster\bulk\route.ts",
    "app\api\seed\route.ts",
    "app\api\seed-workers\route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..."
        
        # Read file content
        $content = Get-Content $file -Raw
        
        # Replace the import and remove the const prisma line
        $content = $content -replace "import \{ PrismaClient \} from '@prisma/client';", "import { prisma } from '@/app/lib/prisma';"
        $content = $content -replace "const prisma = new PrismaClient\(\);[\r\n]+", ""
        
        # Write back
        Set-Content -Path $file -Value $content -NoNewline
        
        Write-Host "✓ $file updated"
    } else {
        Write-Host "✗ $file not found" -ForegroundColor Red
    }
}

Write-Host "`n✅ All files updated!" -ForegroundColor Green
