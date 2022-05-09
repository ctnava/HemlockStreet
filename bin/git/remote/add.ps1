param($repo, $remote)
if($repo -ne "root") {
    Set-Location $repo
    git remote add origin $remote
    git branch -M main
}