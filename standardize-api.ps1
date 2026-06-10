$apiFiles = Get-ChildItem -Path src\app\api -Recurse -Filter "*.ts"
foreach ($file in $apiFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if we need to apply any changes
    if ($content -match "(Next)?Response\.json\(") {
        
        # Add import if missing
        if ($content -notmatch "from '@/lib/utils/api-response'") {
            # Find the first import line or the top of the file
            if ($content -match "^import") {
                $content = $content -replace "^import", "import { apiResponse, apiError } from '@/lib/utils/api-response';`nimport"
            } else {
                $content = "import { apiResponse, apiError } from '@/lib/utils/api-response';`n" + $content
            }
        }

        # Replace error responses: NextResponse.json({ error: "..." }, { status: XXX }) -> apiError("...", XXX)
        $content = $content -replace "NextResponse\.json\(\{\s*error:\s*([^,]+)\s*\}\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\)", "apiError($1, $2)"
        $content = $content -replace "Response\.json\(\{\s*error:\s*([^,]+)\s*\}\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\)", "apiError($1, $2)"
        
        # Replace simple error responses without status (default 500)
        $content = $content -replace "NextResponse\.json\(\{\s*error:\s*([^,]+)\s*\}\s*\)", "apiError($1)"
        $content = $content -replace "Response\.json\(\{\s*error:\s*([^,]+)\s*\}\s*\)", "apiError($1)"

        # Replace success responses: NextResponse.json({ ... }, { status: 200/201 }) -> apiResponse({ ... }, 200/201)
        # Note: This regex is a bit greedy but should work for simple objects
        $content = $content -replace "NextResponse\.json\(\{\s*([^\{]*?)\s*\}\s*,\s*\{\s*status:\s*(20\d)\s*\}\s*\)", "apiResponse({$1}, $2)"
        $content = $content -replace "Response\.json\(\{\s*([^\{]*?)\s*\}\s*,\s*\{\s*status:\s*(20\d)\s*\}\s*\)", "apiResponse({$1}, $2)"
        
        # Replace success responses without status (default 200)
        $content = $content -replace "NextResponse\.json\(\{\s*([^\{]*?)\s*\}\s*\)", "apiResponse({$1})"
        $content = $content -replace "Response\.json\(\{\s*([^\{]*?)\s*\}\s*\)", "apiResponse({$1})"

        Set-Content $file.FullName $content
    }
}
