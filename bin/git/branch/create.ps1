param($repo, $branch)
if($repo -ne "root") {Set-Location $repo}
git checkout -b $branch