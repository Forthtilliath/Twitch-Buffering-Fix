'use strict';

// Requis
var gulp = require('gulp');
// Include plugins
var plugins = require('gulp-load-plugins')(); // tous les plugins de package.json
var gulpif = require('gulp-if');
var minifyCSS = require('gulp-minify-css');
var cp = require('child_process');
var runSequence = require('gulp4-run-sequence').use(gulp);
var del = require('del');



let dir = {
    'dev': './dev/',
    'dist': './dist/'
}

let source = {
    'svg': 'assets/images/buttons/',
    'images': 'assets/images/**/',
    'app_images': 'app/images/**/',
    'app_icons': 'app/icons/',
    'sass': 'assets/styles/**/',
    'useref': '',
    'js': 'assets/scripts/**/',
    'fonts': 'assets/fonts/',
    'racine': ''
}
let dest = {
    'svg': 'assets/images/sprites/',
    'images': 'assets/images/',
    'app_images': 'app/images/',
    'app_icons': 'app/icons/',
    'sass': 'assets/styles/',
    'useref': 'dist',
    'js': 'assets/scripts/',
    'fonts': 'assets/fonts/'
}
let filesIn = {
    'svg': '*.svg',
    'images': '*.+(png|jpg|gif|svg)',
    'icons': '*.png',
    'sass': '*.sass',
    'useref': '*.html',
    'js': '*.js',
    'css': '*.css',
    'fonts': '*',
    'racine': '*'
}
let fileOut = {
    'svg': 'buttons.svg' // Voir pour donner le nom du dossier ou sinon sprite dans le dossier source
}

let tabWatch = ['sass', 'images']; // Tache à écouter

let jsInIndex = ['popup.js']; // Afin de ne pas le prendre en compte dans les fichiers js
let tabJs = [dir.dev + source.js + filesIn.js]; // Fichiers js à compresser, par défaut on les prend tous
//let tabRacine = ['manifest.json', 'create_zip.bat']; // Fichiers à copier

/***************************************************
 * Taches liées à l'application en elle-même
 * |-- Compression des images pour la promotion
 * |-- Compression des icones pour la promotion
 *************************************************/

gulp.task('app_images', function () {
    return gulp.src(dir.dev + source.app_images + filesIn.images)
        .pipe(plugins.plumber())
        .pipe(plugins.cache(plugins.imagemin()))
        .pipe(gulp.dest(dir.dist + dest.app_images))
});

// Compresse les icones
gulp.task('app_icons', function () {
    return gulp.src(dir.dev + source.app_icons + filesIn.icons)
        .pipe(plugins.plumber())
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(dir.dist + dest.app_icons))
});

/***************************************************
 * Taches liées à l'execution de l'application
 * |-- Compilation des svg en sprites
 * |-- Compilation des sass en css
 *************************************************/

// Unify les fichiers svg pour en faire un sprite
gulp.task('svg', function () {
    return gulp.src(dir.svg + source.svg + filesIn.svg) // Récupère les fichiers
        .pipe(plugins.plumber()) // Controles les erreurs
        .pipe(plugins.svgSprite({ // Crée le sprite
            mode: {
                symbol: {
                    dest: './', // Ne pas toucher
                    sprite: fileOut.svg
                }
            }
        }))
        .pipe(gulp.dest(dest.svg)); // Envoi le résultat
});

// TODO Tester
gulp.task('sass', function () {
    return gulp.src(dir.dev + source.sass + filesIn.sass) // Gets all files ending with .scss in app/scss and children directories
        .pipe(plugins.sass())
        .pipe(gulp.dest(dir.dev + dest.sass))
});

/***************************************************
 * Taches liées à la distribution de l'application
 * |-- Supprime le dossier dist
 * |-- Compression des images
 * |-- Compression des js/css
 * |-- Minimisation des js/css
 * |-- Copie des fonts
 * |-- Copie des fichiers à la racine
 *************************************************/

// Supprime le dossier dist
gulp.task('clean', function () {
    return del('dist');
})

// Compresse les images
gulp.task('images', function () {
    return gulp.src(dir.dev + source.images + filesIn.images)
        .pipe(plugins.plumber())
        .pipe(plugins.imagemin({
            interlaced: true
        }))
        .pipe(gulp.dest(dir.dist + dest.images))
});

// Compression + Minimisation des js/css
gulp.task('useref', function () {
    return gulp.src(dir.dev + source.useref + filesIn.useref)
        .pipe(plugins.useref())
        .pipe(gulpif(filesIn.js, plugins.uglify())) // pour minifier les fichiers Javascript
        .pipe(gulpif(filesIn.css, minifyCSS())) // pour minifier les fichiers CSS
        .pipe(gulp.dest(dir.dist))
});

// Compression + Minimisation des js/css
gulp.task('js', function () {
    jsInIndex.forEach(function (js) {
        tabJs.push('!' + dir.dev + source.js + js);
    });
    return gulp.src(tabJs)
        .pipe(plugins.uglify()) // pour minifier les fichiers Javascript
        .pipe(plugins.rename({
            extname: ".min.js"
        }))
        .pipe(gulp.dest(dir.dist + dest.js))
});

// Copie des fonts
gulp.task('fonts', function () {
    return gulp.src(dir.dev + source.fonts + filesIn.fonts)
        .pipe(gulp.dest(dir.dist + dest.fonts))
});

// Copie des fichiers à la racine
/*gulp.task('racine', function () {
    let filesToCopy = new Array();
    tabRacine.forEach(function (file) {
        filesToCopy.push(dir.dev + file);
    });
    return gulp.src(filesToCopy)
        .pipe(gulp.dest(dir.dist))
});*/
gulp.task('racine', function () {
    return gulp.src(dir.dev + source.racine + filesIn.racine)
        .pipe(gulp.dest(dir.dist))
});

// Permet d'executer create_zip à partir du dossier dist
// (ca évite d'avoir uniquement le contenu du dossier dist dans le zip)
gulp.task('archive', function () {
    return cp.exec('call_create_zip.bat');
});


/***************************************************
 * Liste des taches
 * |-- Tâches app
 * |-- Tâches build
 * |-- Tâches dist
 * |-- Tâches watch
 *************************************************/

// Tâche app : Utile pour ajouter l'application sur le store
gulp.task('app', gulp.series('app_icons', 'app_images'));

// Tâche build : Utile pour exécuter l'application lors des tests
gulp.task('build', gulp.series('svg', 'sass'));

// Tâche dist : Compresse et copie l'ensemble des fichiers pour la distribution
gulp.task('dist', gulp.series('clean', 'app', 'images', 'racine', 'useref', 'js', 'fonts', 'archive'));

// Tâche par défaut
gulp.task('default', gulp.series('build'));

// Tâche "watch"
gulp.task('watch', function () {
    // Lance un watch pour chaque tache dans le tableau
    tabWatch.forEach(function (uneTache) {
        console.log("Démarrage du watch de " + uneTache + "...");
        gulp.watch(dir.dev + source[uneTache] + filesIn[uneTache], gulp.series(uneTache));
    });
});
