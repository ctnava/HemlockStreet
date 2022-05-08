param($repo, $branch)
if($repo -ne "root") {Set-Location $repo}
git branch -d $branch