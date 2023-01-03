# Build the docker image
docker build . -t "docker.pkg.github.com/teammonumenta/monumenta-website/monumenta-items"
if [[ $? -ne 0 ]]; then
	exit 1
fi
docker push "docker.pkg.github.com/teammonumenta/monumenta-website/monumenta-items"

# Deploy the new image
kubectl apply -f items.playmonumenta.com.yml
kubectl scale deployment.apps/web-items --replicas 0
sleep 10
kubectl scale deployment.apps/web-items --replicas 1
