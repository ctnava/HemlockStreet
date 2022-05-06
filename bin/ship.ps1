param($repo, $commitMessage)
Set-Location $repo
git add .
git commit -m "push to heroku"
git push heroku main