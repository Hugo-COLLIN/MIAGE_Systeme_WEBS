# WEBS Application
**Hugo COLLIN, Chloé MAYER, Anikati M'MADI**

## Description
TODO

## Guide de démarrage
### 0. Préparation générale
- Avoir son environnement à jour
```sh
# Mettre à jour le gestionnaire de paquets
sudo apt update

# Réparer les dépendances (en cas de problème)
sudo apt --fix-broken install

# Installer les mises à jour
sudo apt upgrade -y
```

- Installer les outils de base :
    - Python
    ```sh
    # Installer Python en utilisant le PPA deadsnakes
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

- Avoir installé Git, [avoir initialisé sa clé SSH liée à GitHub](https://gist.github.com/Hugo-COLLIN/456fd191689c11a59e76a66d3ad887d8) puis cloner le dépôt :
```sh
git clone git@github.com:Hugo-COLLIN/MIAGE_Systeme_WEBS.git
```

### 1. Préparer l'environnement de développement
1. Se placer dans le répertoire du projet
2. Créer l'environnement virtuel Python :
```sh
python3 -m venv venv
source venv/bin/activate
```

3. Installer les dépendances Python :
```sh
pip install -r requirements.txt
```

4. Compiler le deamon via le Makefile :
```sh
make
```

### 2. Lancer l'application
1. Avoir compilé le daemon avec `make`

2. Lancer :
```sh
python3 run.py
```

3. Ouvrir le navigateur à l'url indiquée