# WEBS Application
**Hugo COLLIN, Chloé MAYER, Anikati M'MADI**

## Description
TODO

## Guide de démarrage avec Docker
### 1. Prérequis
1. Avoir son environnement à jour (Linux uniquement) :
```sh
sudo apt update
sudo apt upgrade -y

# Réparer les dépendances (en cas de problème) :
sudo apt --fix-broken install
```

2. [Avoir installé Git](https://git-scm.com/downloads)

3. [Avoir initialisé sa clé SSH liée à GitHub](https://gist.github.com/Hugo-COLLIN/456fd191689c11a59e76a66d3ad887d8)

4. [Avoir installé Docker et Docker Compose](https://docs.docker.com/get-started/get-docker)

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


## Guide de démarrage avec un système Ubuntu 22.04
### 0. Préparation générale
1. Avoir son environnement à jour
```sh
# Mettre à jour le gestionnaire de paquets
sudo apt update

# Réparer les dépendances (en cas de problème)
sudo apt --fix-broken install

# Installer les mises à jour
sudo apt upgrade -y
```

2. Installer les outils de base :
  - Git
    ```sh
    sudo apt install git
    ```

  - Python
    ```sh
    # Installer Python (en utilisant le PPA deadsnakes)
    sudo add-apt-repository ppa:deadsnakes/ppa -y
    sudo apt update
    sudo apt install python3.10-dev python3.10-venv python3.10-distutils -y

    # Vérifier l'installation
    python3.10 --version
    ```

  - Outils de compilation
    ```sh
    sudo apt install build-essential cmake
    ```

3. [Initialiser sa clé SSH liée à GitHub](https://gist.github.com/Hugo-COLLIN/456fd191689c11a59e76a66d3ad887d8)

4. Cloner le dépôt :
```sh
git clone git@github.com:Hugo-COLLIN/MIAGE_Systeme_WEBS.git
```

### 1. Préparer l'environnement de développement
1. Se placer dans le répertoire du projet (`cd MIAGE_Systeme_WEBS`)
2. Copier le dossier `sensor/` depuis l'archive disponible sur le cours en ligne à la racine du projet.
3. Créer l'environnement virtuel Python :
```sh
python3 -m venv venv
source venv/bin/activate
```

4. Installer les dépendances Python :
```sh
pip install -r requirements.txt
```

5. Compiler le deamon via le Makefile :
```sh
make
```

### 2. Lancer l'application
1. Avoir compilé le daemon avec `make` (ne pas oublier de recompiler après toute modification de `daemon.c`)

2. Lancer :
```sh
python3 run.py
```

3. Ouvrir le navigateur à l'url indiquée
