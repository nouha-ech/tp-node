
// postManager.js

const fs = require('fs');
const path = require('path');

const POSTS_FILE = path.join(__dirname, 'posts.json');

// Lire tous les posts
function getAllPosts(callback) {

    fs.readFile(POSTS_FILE, 'utf8', (err, data) => {

        if (err) {
            return callback(err, null);
        }

        try {
            const posts = JSON.parse(data);
            callback(null, posts);

        } catch (parseError) {
            callback(parseError, null);
        }
    });
}

// Obtenir un post par ID
function getPost(id, callback) {

    getAllPosts((err, posts) => {

        if (err) {
            return callback(err, null);
        }

        const post = posts.find(p => p.id === Number(id));

        if (!post) {
            return callback(null, null);
        }

        callback(null, post);
    });
}

// Insérer un nouveau post
function insertPost(newPost, callback) {

    getAllPosts((err, posts) => {

        if (err) {
            return callback(err, null);
        }

        const maxId = posts.reduce(
            (max, post) => Math.max(max, post.id),
            0
        );

        const post = {
            id: maxId + 1,
            userId: Number(newPost.userId),
            title: newPost.title,
            body: newPost.body
        };

        posts.push(post);

        savePosts(posts, (saveError) => {

            if (saveError) {
                return callback(saveError, null);
            }

            callback(null, post);
        });
    });
}

// Mettre à jour un post
function updatePost(id, updatedPost, callback) {

    getAllPosts((err, posts) => {

        if (err) {
            return callback(err, null);
        }

        const index = posts.findIndex(
            p => p.id === Number(id)
        );

        if (index === -1) {
            return callback(null, null);
        }

        posts[index] = {
            ...posts[index],
            userId: updatedPost.userId !== undefined
                ? Number(updatedPost.userId)
                : posts[index].userId,
            title: updatedPost.title !== undefined
                ? updatedPost.title
                : posts[index].title,
            body: updatedPost.body !== undefined
                ? updatedPost.body
                : posts[index].body,
            id: posts[index].id
        };

        savePosts(posts, (saveError) => {

            if (saveError) {
                return callback(saveError, null);
            }

            callback(null, posts[index]);
        });
    });
}

// Supprimer un post
function deletePost(id, callback) {

    getAllPosts((err, posts) => {

        if (err) {
            return callback(err, null);
        }

        const index = posts.findIndex(
            p => p.id === Number(id)
        );

        if (index === -1) {
            return callback(null, null);
        }

        const deletedPost = posts.splice(index, 1)[0];

        savePosts(posts, (saveError) => {

            if (saveError) {
                return callback(saveError, null);
            }

            callback(null, deletedPost);
        });
    });
}

// Fonction utilitaire pour sauvegarder les posts
function savePosts(posts, callback) {

    fs.writeFile(
        POSTS_FILE,
        JSON.stringify(posts, null, 2),
        'utf8',
        callback
    );
}

// Exporter les fonctions
module.exports = {
    getAllPosts,
    getPost,
    insertPost,
    updatePost,
    deletePost
};
