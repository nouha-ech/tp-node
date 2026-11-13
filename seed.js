const https = require('https');
const fs = require('fs');

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Fonction pour récupérer les posts
function fetchPosts() {

    console.log('Récupération des posts...');

    https.get(API_URL, (response) => {

        let data = '';

     
        response.on('data', (chunk) => {
            data += chunk;
        });

        // Lorsque la réception est terminée
        response.on('end', () => {

            if (response.statusCode !== 200) {
                console.error('Erreur HTTP :', response.statusCode);
                return;
            }

            try {
                const posts = JSON.parse(data);

                console.log(posts.length + ' posts récupérés.');

                savePosts(posts);

            } catch (error) {
                console.error('Erreur lors de la lecture JSON :', error.message);
            }
        });

    }).on('error', (error) => {
        console.error('Erreur de connexion :', error.message);
    });
}

// Fonction pour sauvegarder les posts
function savePosts(posts) {

    fs.writeFile(
        'posts.json',
        JSON.stringify(posts, null, 2),
        'utf8',
        (error) => {

            if (error) {
                console.error('Erreur de sauvegarde :', error.message);
                return;
            }

            console.log('Les posts ont été sauvegardés dans posts.json');
        }
    );
}

fetchPosts();
