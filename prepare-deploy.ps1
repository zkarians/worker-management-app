# 🚀 빠른 배포 준비 스크립트
# Cloudtype 재배포 전 체크리스트 실행

echo "========================================="
echo "Cloudtype 재배포 준비 체크"
echo "========================================="
echo ""

# 1. Prisma schema 확인
echo "1. Prisma Schema 확인 중..."
$schemaContent = Get-Content "prisma\schema.prisma" -Raw

if ($schemaContent -match 'provider\s*=\s*"postgresql"') {
    Write-Host "   ✅ Prisma가 PostgreSQL로 설정됨" -ForegroundColor Green
} else {
    Write-Host "   ❌ Prisma가 PostgreSQL로 설정되지 않음!" -ForegroundColor Red
    Write-Host "   prisma/schema.prisma를 확인하세요." -ForegroundColor Yellow
    exit 1
}

if ($schemaContent -match 'url\s*=\s*env\("DATABASE_URL"\)') {
    Write-Host "   ✅ DATABASE_URL 환경 변수 사용 중" -ForegroundColor Green
} else {
    Write-Host "   ❌ DATABASE_URL 환경 변수가 설정되지 않음!" -ForegroundColor Red
    exit 1
}

echo ""

# 2. Prisma Client 생성
echo "2. Prisma Client 재생성 중..."
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Prisma Client 생성 완료" -ForegroundColor Green
} else {
    Write-Host "   ❌ Prisma Client 생성 실패!" -ForegroundColor Red
    exit 1
}

echo ""

# 3. 빌드 테스트
echo "3. 프로덕션 빌드 테스트 중..."
echo "   (이 단계는 시간이 걸릴 수 있습니다...)"
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ 빌드 성공!" -ForegroundColor Green
} else {
    Write-Host "   ❌ 빌드 실패! 에러를 확인하세요." -ForegroundColor Red
    exit 1
}

echo ""
echo "========================================="
echo "✅ 모든 체크 완료!"
echo "========================================="
echo ""
Write-Host "다음 단계:" -ForegroundColor Cyan
echo "1. Git에 커밋 및 푸시:"
echo "   git add ."
echo "   git commit -m 'Fix: PostgreSQL 설정 및 UTF-8 인코딩'"
echo "   git push"
echo ""
echo "2. Cloudtype 대시보드에서 재배포"
echo "   https://cloudtype.io"
echo ""
echo "3. 배포 후 테스트:"
echo "   https://port-0-node-express-mikozlgaf4d4aa53.sel3.cloudtype.app/api/health"
echo ""
Write-Host "재배포가 완료되면 정상 작동할 것입니다! 🚀" -ForegroundColor Green
