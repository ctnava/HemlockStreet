param($repo, $branch, $commitMessage)
if($repo -ne "root") {Set-Location $repo}
git add . 
git commit -m $commitMessage
git push origin $branch