# Create test files for Files Module testing
Write-Host "Creating test files for Files Module testing..." -ForegroundColor Yellow

# Create test directory if it doesn't exist
$testDir = "test-files"
if (-not (Test-Path $testDir)) {
    New-Item -ItemType Directory -Path $testDir | Out-Null
}

# Create test files
$testFiles = @(
    @{ Name = "test-document.txt"; Content = "This is a test document for file upload testing.`nCreated at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`nThis file is used to test the Files Module upload functionality." },
    @{ Name = "test-image.jpg"; Content = "FAKE_JPEG_DATA" },
    @{ Name = "test-pdf.pdf"; Content = "FAKE_PDF_DATA" },
    @{ Name = "patient-report.txt"; Content = "Patient Medical Report`nPatient ID: TEST123`nDate: $(Get-Date -Format 'yyyy-MM-dd')`n`nThis is a test medical report document." },
    @{ Name = "consultation-notes.txt"; Content = "Consultation Notes`nDate: $(Get-Date -Format 'yyyy-MM-dd')`n`nTest consultation notes for file upload testing." }
)

foreach ($file in $testFiles) {
    $filePath = Join-Path $testDir $file.Name
    $file.Content | Out-File -FilePath $filePath -Encoding UTF8
    Write-Host "Created: $filePath" -ForegroundColor Green
}

Write-Host "`nTest files created in: $testDir" -ForegroundColor Cyan
Write-Host "You can now use these files in Postman for file upload tests.`n" -ForegroundColor Yellow

