param($repo, $branch)
if($repo -ne "root") {Set-Location $repo}
git push origin --delete $branch