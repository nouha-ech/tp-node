const http = require('http');
const url = require('url');
const postManager = require('./postManager');

const PORT = 3000;

function parseJsonBody(request, callback) {

    let body = '';

    request.on('data', chunk => {
        body += chunk.toString();
    });

    request.on('end', () => {

        try {
            const data = JSON.parse(body);
            callback(null, data);

        } catch (error) {
            callback(error, null);
        }
    });

    request.on('error', error => {
        callback(error, null);
    });
}

// Créer le serveur HTTP
const server = http.createServer((request, response) => {

    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;
    const method = request.method;

    // Headers CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );
    response.setHeader('Content-Type', 'application/json');

    // Gérer les requêtes OPTIONS
    if (method === 'OPTIONS') {
        response.writeHead(204);
        return response.end();
    }

    // GET /api/posts
    // Obtenir tous les posts
    if (pathname === '/api/posts' && method === 'GET') {

        postManager.getAllPosts((err, posts) => {

            if (err) {
                response.writeHead(500);
                return response.end(JSON.stringify({
                    error: 'Erreur serveur'
                }));
            }

            response.writeHead(200);
            response.end(JSON.stringify(posts));
        });

    }

    // GET /api/posts/:id
    // Obtenir un post par ID
    else if (
        pathname.match(/^\/api\/posts\/\d+$/) &&
        method === 'GET'
    ) {

        const id = pathname.split('/')[3];

        postManager.getPost(id, (err, post) => {

            if (err) {
                response.writeHead(500);
                return response.end(JSON.stringify({
                    error: 'Erreur serveur'
                }));
            }

            if (!post) {
                response.writeHead(404);
                return response.end(JSON.stringify({
                    error: 'Post non trouvé'
                }));
            }

            response.writeHead(200);
            response.end(JSON.stringify(post));
        });

    }

    // POST /api/posts
    // Créer un nouveau post
    else if (pathname === '/api/posts' && method === 'POST') {

        parseJsonBody(request, (err, data) => {

            if (err) {
                response.writeHead(400);
                return response.end(JSON.stringify({
                    error: 'JSON invalide'
                }));
            }

            if (
                !data ||
                data.userId === undefined ||
                !Number.isInteger(Number(data.userId)) ||
                Number(data.userId) <= 0 ||
                typeof data.title !== 'string' ||
                !data.title.trim() ||
                typeof data.body !== 'string' ||
                !data.body.trim()
            ) {
                response.writeHead(400);
                return response.end(JSON.stringify({
                    error: 'userId, title et body sont obligatoires'
                }));
            }

            postManager.insertPost(data, (saveError, newPost) => {

                if (saveError) {
                    response.writeHead(500);
                    return response.end(JSON.stringify({
                        error: 'Erreur lors de la création'
                    }));
                }

                response.writeHead(201);
                response.end(JSON.stringify(newPost));
            });
        });

    }

    // PUT /api/posts/:id
    // Modifier un post
    else if (
        pathname.match(/^\/api\/posts\/\d+$/) &&
        method === 'PUT'
    ) {

        const id = pathname.split('/')[3];

        parseJsonBody(request, (err, data) => {

            if (err) {
                response.writeHead(400);
                return response.end(JSON.stringify({
                    error: 'JSON invalide'
                }));
            }

            if (
                !data ||
                (
                    data.userId === undefined &&
                    data.title === undefined &&
                    data.body === undefined
                ) ||
                (
                    data.userId !== undefined &&
                    (
                        !Number.isInteger(Number(data.userId)) ||
                        Number(data.userId) <= 0
                    )
                ) ||
                (
                    data.title !== undefined &&
                    (
                        typeof data.title !== 'string' ||
                        !data.title.trim()
                    )
                ) ||
                (
                    data.body !== undefined &&
                    (
                        typeof data.body !== 'string' ||
                        !data.body.trim()
                    )
                )
            ) {
                response.writeHead(400);
                return response.end(JSON.stringify({
                    error: 'Données de modification invalides'
                }));
            }

            postManager.updatePost(id, data, (updateError, post) => {

                if (updateError) {
                    response.writeHead(500);
                    return response.end(JSON.stringify({
                        error: 'Erreur lors de la modification'
                    }));
                }

                if (!post) {
                    response.writeHead(404);
                    return response.end(JSON.stringify({
                        error: 'Post non trouvé'
                    }));
                }

                response.writeHead(200);
                response.end(JSON.stringify(post));
            });
        });

    }

    // DELETE /api/posts/:id
    // Supprimer un post
    else if (
        pathname.match(/^\/api\/posts\/\d+$/) &&
        method === 'DELETE'
    ) {

        const id = pathname.split('/')[3];

        postManager.deletePost(id, (err, deletedPost) => {

            if (err) {
                response.writeHead(500);
                return response.end(JSON.stringify({
                    error: 'Erreur lors de la suppression'
                }));
            }

            if (!deletedPost) {
                response.writeHead(404);
                return response.end(JSON.stringify({
                    error: 'Post non trouvé'
                }));
            }

            response.writeHead(200);
            response.end(JSON.stringify({
                message: 'Post supprimé avec succès',
                post: deletedPost
            }));
        });

    }

    // Route non trouvée
    else {

        response.writeHead(404);
        response.end(JSON.stringify({
            error: 'Route non trouvée'
        }));
    }

});

// Démarrer le serveur
server.listen(PORT, () => {

    console.log(`Serveur API démarré sur http://localhost:${PORT}`);

    console.log('Routes disponibles:');
    console.log('GET    /api/posts');
    console.log('GET    /api/posts/:id');
    console.log('POST   /api/posts');
    console.log('PUT    /api/posts/:id');
    console.log('DELETE /api/posts/:id');
});
