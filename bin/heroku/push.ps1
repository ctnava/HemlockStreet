param($repo, $commitMessage)
Set-Location $repo
git add .
git commit -m $commitMessage
git push heroku main