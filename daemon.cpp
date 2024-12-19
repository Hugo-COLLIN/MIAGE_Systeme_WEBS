/**
* MASTER MIAGE M1
* Cours Système
* Enseignant : Hendry F. Chame
*/

#include <fstream>
#include <sstream>
#include <string.h>
#include <iostream>
#include <iomanip>
#include <vector>
#include <algorithm>
#include <unistd.h>
#include <csignal>
#include <stdexcept>

// Variables globales
const std::string dirPrefix = {"sensor/"};
std::string subject;
int my_sId, my_activity, my_index;

// Saugarde l'index d'itération
void setIterationIndex(std::string fname){
    std::stringstream ss;
    ss << dirPrefix << "/index/" << fname << "_activity"<< my_activity << ".idx";
    std::string filename = ss.str();
    std::ofstream ofile;
    ofile.open(filename);
    ofile << my_index;
    ofile.close();
}

// Lecture de l'index et activité
void getIterationIndex(std::string fname){
    std::stringstream ss;
    ss << dirPrefix << "/index/" << fname << "_activity"<< my_activity << ".idx";
    std::string filename = ss.str();

    // création d’un object ifstream
    std::ifstream ifile;

    // ouverture du fichier
    ifile.open(filename);

    if (ifile){
        std::string line;
        std::getline (ifile, line);
        my_index = atoi(line.c_str());
        ifile.close();
    }
}

// Interception du signal kill et sauvegarde de l'index d'itération
void signal_handler(int signal){
    setIterationIndex(subject);
    exit(1);
}

// Fonction pour vérifier l'existence d'un fichier
bool fileExists(const std::string& filename) {
    std::ifstream file(filename);
    return file.good();
}

// Fonction main: itération en boucle des données
int main(int argc, char *argv[]){
    try {
        my_sId = 0;
        my_activity = 0;
        my_index = 1;
        int refresh_rate = 1000;
        subject.append("subject");

        // Install a signal handler
        std::signal(SIGINT, signal_handler);

        if (argc > 3 && argv[0] != "") {
            my_sId = atoi(argv[1]);
            my_activity = atoi(argv[2]);
            refresh_rate = atoi(argv[3]);
        }
        subject.append(std::to_string(my_sId));

        getIterationIndex(subject);

        std::stringstream ss;
        ss << dirPrefix << "data/" << subject << "_activity" << my_activity << ".csv";
        std::string filename = ss.str();

        if (!fileExists(filename)) {
            throw std::runtime_error("Le fichier de données n'existe pas : " + filename);
        }

        std::ifstream input(filename);

        if (!input.is_open()) {
            throw std::runtime_error("Erreur de lecture du fichier : " + filename);
        }

        std::vector<std::vector<std::string>> csvRows;

        int k = 0;
        // sauter jusqu'à la ligne de l'index
        while (k++ < my_index){
            std::string line;
            std::getline(input, line);
        }
        while(true){
            std::string line;
            while(std::getline(input, line)){
                my_index++;
                std::cout << line << std::endl;
                usleep(refresh_rate * 1000); // dormir pendant refresh_rate ms
            }
            my_index = 1;
            input.clear();
            input.seekg (0); // aller à l'index 0
            std::getline(input, line);
        }
    } catch (const std::exception& e) {
        std::cerr << "Erreur : " << e.what() << std::endl;
        return 1;
    }
}
