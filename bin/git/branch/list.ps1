param($repo)
if($repo -ne "root") {Set-Location $repo}
git branch