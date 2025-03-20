# remove existing container

docker rm hush_app

docker build -t hush .

docker run -p 3000:3000 --name hush_app --env-file .env.prod hush