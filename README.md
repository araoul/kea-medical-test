# kea-medical-test

## Pre-requisites

Node.js >= 12.9.0
Au premier il faut Démarrer une instance de Mysql server
Le serveur Mysql est utilisé pour les données issues des models de l'application 

Créer une base de données: "dbkeamedicaltest" (démarrer l'application va générer automatiquement les tables dans la base de données)


## Installation
Suivre les étapes suivantes pour cloner le projet.


```sh
$ npm i -g @loopback/cli
$ git clone  git clone https://github.com/kea-medical-test.git
$ cd kea-medical-test
$ npm i
$ npm start
```

## Utilisation

L'application s'executera à l'adresse http://localhost:3000 and  l'API Explorer à l'adresse
http://localhost:3000/explorer/.

Clic sur "explorer" et vous serez redirigé vers http://localhost:3000/explorer/.

You devez créer un nouvel utilisteur avec l'api the register (http://127.0.0.1:3000/users/register).
Après vous devez vous connecter avec l'api de login (http://127.0.0.1:3000/users/login) et un token sera genere dans la response body

Après, copier le token and aller au button "authorize"en haut de l'ecran (avec une image de serrure). clic sur le button. A pop-up apparait et donc coller le token et clic sur le button "authorize".

Ainsi vous avez l'authorisation sur tous les apis disposant d'une image de serrure.


## Models
L'application a les models suivants:


1. `User` - representant les candidats.
2. `UserCredentials` - representant données sensibles comme un mot de passe.
3. `Candidature` - un model representant la candidature
3. `Poste` - un model representant un poste

`Poste`  et `User` sot marqués comme appartenant au model  `Candidature` par l'utilisation de decorateur de model`@belongsTo`. Parallèlement, le model `Candidature` est marqué comme possedant un seul
`Poste` et un seul `User` utilisant le decorateur de model `@hasOne`.

`User` est aussi marqué comme ayant un model  `UserCredentials` utilisant le decorateur `@hasOne`.

## Controllers

Les Controller exposent les API pour interagir avec les models et plus.

Dans notre appli, nous avons quatre controllers:

1. `ping` - un simple controller to verifier le status de l'appli.
2. `user` - controller pour créer un user, obtenir ses infos, et pour le logging.
3. `poste` - controller pour créer un poste, obtenir la liste des postes etc...
4. `candidature` - controller pour créer, mettre à jour et supprimer une candidature.

## Services

Les services sont des composants modulaires qui peuvent être connectés à une application LoopBack
dans divers endroits pour apporter des capacités et fonctionnalités supplémentaires au
application.

Cette appli dispose de six services:

1. `services/user-service` - responsable de vérifier si l'utilisateur existe et le
   Le mot de passe soumis correspond à celui de l'utilisateur existant.
2. `services/hash.password.bcryptjs` - responsable de générer et de comparer
   hachages de mot de passe.
3. `services/validator` - responsable de la validation du mot de passe lorsqu'un
   un nouvel utilisateur est créé.
4. `services/jwt-service` - responsable de la génération et de la vérification du jeton Web JSON.
5. `services/basic.authorizor` - responsable du contrôle des contrôleurs avec le rôle d'autorisation.

## Authentication

_Note: Cette application contient une API `login`._

### Login


L'Api pour la connexion d'un utilisateur est une requête `POST` à `/users/login`.

Une fois les informations d'identification extraites, l'implémentation de la connexion au
le niveau du contrôleur n'est qu'un processus en quatre étapes. Ce niveau de simplicité est fait
possible par l'utilisation du service `UserService` fourni par
`@loopback/authentification`.

1. `const user = await this.userService.verifyCredentials(credentials)` - Vérifier
   les informations d'identification
2. `const userProfile = this.userService.convertToUserProfile(user)` - produire un objet profil utilisateur.
3. `const token = await this.jwtService.generateToken(userProfile)` - générer JWT basé sur l'objet de profil utilisateur.
4. `return {token}`- envoyer le JWT.

### Authorization

L'autorisation du point de terminaison se fait à l'aide
[@loopback/authorization](https://github.com/strongloop/loopback-next/tree/master/packages/authorization).
Utilisez le décorateur `@authorize` pour protéger l'accès aux méthodes du contrôleur.

Toutes les méthodes de contrôleur sans le décorateur `@authorize` seront accessibles à
toutes les personnes. Pour restreindre l'accès, spécifiez les rôles dans la propriété ʻallowedRoles`.
Voici deux exemples pour illustrer ce point.


Méthode de contrôleur non protégée (pas de décorateur `@authorize`), tout le monde peut y accéder:

```ts
async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    newUserRequest: Omit<NewUserRequest, 'id'>,
): Promise<{token: string}> {
    ....
}
```

Méthode de contrôleur protégée, seuls ʻadmin`, `support` et ʻuser` peuvent y accéder:

```ts
@authorize({
    allowedRoles: ['admin', 'support', 'user'],
    voters: [basicAuthorization],
  })
  async find(
  ): Promise<User[]> {
    return this.userRepository.find();
  }
```


Il y a trois rôles: `admin`, `support` et `user`. Vous pouvez
parcourir les méthodes du contrôleur dans
[user-controller.ts](kea-medical-test/src/controllers/user.controller.ts) and
[candidature.controller.ts](kea-medical-test/src/controllers/candidature.controller.ts)
pour voir quels rôles ont accès à quelles méthodes.

La mise en œuvre de l'autorisation se fait via les fonctions d'électeur. Dans cette application, il y a
est juste une fonction d'électeur unique - «autorisation de base». Il met en œuvre les règles suivantes:

1. Aucun accès si l'utilisateur a été créé sans propriété `roles`.
2. Aucun accès si le rôle de l'utilisateur n'est pas dans l'autorisation `allowedRoles`
   métadonnées.
3. L'utilisateur ne peut accéder qu'aux modèles lui appartenant.
4. Les rôles `admin` et `support` contournent le contrôle de propriété du modèle.

