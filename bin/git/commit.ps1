param($repo, $commitMessage)
if($repo -ne "root") {Set-Location $repo}
git add . 
git commit -m $commitMessage