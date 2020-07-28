# Noots

### Docker commands

* docker build -t davydq/noots-write_api . -f writeAPI.dockerfile
* docker build -t davydq/noots-web . -f webClient.dockerfile

### Worker commands
```
ng build --prod
http-server -p 8080 -c-1 dist/Client
http://localhost:8080/

  "dataGroups": [{
    "name": "api-performance",
    "urls": [
      "http://localhost:5000/**"
    ],
    "cacheConfig": {
      "maxSize": 10000,
      "maxAge": "3d",
      "strategy": "performance"
    }
  }]
```

  // TEST22
