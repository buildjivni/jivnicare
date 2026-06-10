$apiFiles = Get-ChildItem -Path src\app\api -Recurse -Filter "*.ts"
foreach ($file in $apiFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    
    if ($content -match "(Next)?Response\.json\(") {
        
        # Add import if missing
        if ($content -notmatch "from '@/lib/utils/api-response'") {
             if ($content -match "^import") {
                $content = "import { apiResponse, apiError } from '@/lib/utils/api-response';`n" + $content
            } else {
                $content = "import { apiResponse, apiError } from '@/lib/utils/api-response';`n" + $content
            }
        }

        # 1. Replace errors with status
        $content = $content -replace "(?ms)(?:Next)?Response\.json\(\{\s*error:\s*([^,]+?)\s*\}\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\)", 'apiError($1, $2)'
        
        # 2. Replace errors without status
        $content = $content -replace "(?ms)(?:Next)?Response\.json\(\{\s*error:\s*([^,]+?)\s*\}\s*\)", 'apiError($1)'

        # 3. Replace success with status (simple objects)
        $content = $content -replace "(?ms)(?:Next)?Response\.json\(\{\s*(?!\s*error:)([^\{\}]*?)\s*\}\s*,\s*\{\s*status:\s*(20\d)\s*\}\s*\)", 'apiResponse({$1}, $2)'
        
        # 4. Replace success without status (simple objects)
        $content = $content -replace "(?ms)(?:Next)?Response\.json\(\{\s*(?!\s*error:)([^\{\}]*?)\s*\}\s*\)", 'apiResponse({$1})'

        [System.IO.File]::WriteAllText($file.FullName, $content)
    }
}
