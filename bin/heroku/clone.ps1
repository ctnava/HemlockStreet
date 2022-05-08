param($repo, $analog)
Set-Location heroku
heroku git:clone -a $repo
Rename-Item $repo -Newname $analog