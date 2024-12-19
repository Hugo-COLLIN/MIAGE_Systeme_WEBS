# WEBS Application
**Hugo COLLIN, Chloé MAYER, Anikati M'MADI**

## Description
TODO

## Guide de démarrage
### 1. Préparation générale
1. Mettre à jour l'environnement :
```sh
sudo apt update
sudo apt upgrade -y

# Réparer les dépendances (en cas de problème) :
sudo apt --fix-broken install
```

2. Installer Git
```sh
sudo apt install git
```

3. [Initialiser sa clé SSH liée à GitHub](https://gist.github.com/Hugo-COLLIN/456fd191689c11a59e76a66d3ad887d8)

4. [Installer Docker et Docker Compose](https://docs.docker.com/get-started/get-docker)

5. Cloner le dépôt :
```sh
git clone git@github.com:Hugo-COLLIN/MIAGE_Systeme_WEBS.git
cd MIAGE_Systeme_WEBS
```

### 2. Construire et lancer l'application

1. Construire l'image Docker :
```sh
docker-compose build
```

2. Lancer l'application :
```sh
docker-compose up --watch
# --watch permet de relancer l'application automatiquement en cas de modification du code source
```
  - Note: Sans `--watch`, toute modification du code source nécessite de reconstruire l'image Docker avec `docker-compose build` avant de relancer l'application.


3. Ouvrir le navigateur à l'adresse : `http://localhost:5000`

Pour arrêter l'application, utiliser `Ctrl+C` dans le terminal où a été lancé `docker-compose up`, puis exécuter :
```sh
docker-compose down
```

### Notes supplémentaires
- Les données d'exemple sont maintenant incluses dans l'image Docker, donc il n'est pas nécessaire de les copier manuellement.
- Pour les développements futurs, vous pouvez modifier le code source sur votre machine hôte. Les changements seront pris en compte lors de la prochaine construction de l'image.
