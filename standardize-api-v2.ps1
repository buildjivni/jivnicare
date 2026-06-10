$apiFiles = Get-ChildItem -Path src\app\api -Recurse -Filter "*.ts"
foreach ($file in $apiFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    
    # First, fix any broken apiError(, ) or apiResponse({}, ) from previous failed run
    # This is a bit aggressive but needed to recover.
    # Actually, it's better to just do the full replacement correctly now.

    # 1. Add/Fix Import
    if ($content -match "Response\.json\(" -or $content -match "apiError\(" -or $content -match "apiResponse\(") {
        if ($content -notmatch "from '@/lib/utils/api-response'") {
             if ($content -match "^import") {
                $content = "import { apiResponse, apiError } from '@/lib/utils/api-response';`n" + $content
            } else {
                $content = "import { apiResponse, apiError } from '@/lib/utils/api-response';`n" + $content
            }
        }
    }

    # 2. Correct replacement for Errors with status
    $content = $content -replace "(?:Next)?Response\.json\(\{\s*error:\s*([^,]+?)\s*\}\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\)", 'apiError($1, $2)'
    
    # 3. Correct replacement for Errors without status
    $content = $content -replace "(?:Next)?Response\.json\(\{\s*error:\s*([^,]+?)\s*\}\s*\)", 'apiError($1)'

    # 4. Correct replacement for Success with status
    # We use a non-greedy match for the object content, but avoid matching if it's an error object
    $content = $content -replace "(?:Next)?Response\.json\(\{\s*(?!\s*error:)(.*?)\s*\}\s*,\s*\{\s*status:\s*(20\d)\s*\}\s*\)", 'apiResponse({$1}, $2)'

    # 5. Correct replacement for Success without status
    $content = $content -replace "(?:Next)?Response\.json\(\{\s*(?!\s*error:)(.*?)\s*\}\s*\)", 'apiResponse({$1})'

    # 6. Cleanup duplicate imports
    $content = $content -replace "(import \{ apiResponse, apiError \} from '@/lib/utils/api-response';\s*){2,}", "import { apiResponse, apiError } from '@/lib/utils/api-response';`n"

    [System.IO.File]::WriteAllText($file.FullName, $content)
}
