import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
  model,
  property,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository, Credentials} from '../repositories';
import { inject } from '@loopback/core';
import { PasswordHasherBindings, TokenServiceBindings, UserServiceBindings } from '../keys';
import { PasswordHasher } from '../services/hash.password.bcryptjs';
import { TokenService, UserService, authenticate } from '@loopback/authentication';
import _ from 'lodash';
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';


@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
  ) {}

  /**
   * creer compte pour un candidat(enregistrer un candidat)
   * @param newUserRequest 
   */
  @post('/candidats/register', {
    responses: {
      '200': {
        description: 'Candidat model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
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

     // vérifier  si l'utilisateur exist déjà dans la base son telephone doit être unique
     const foundUser = await this.userRepository.findOne({
      where: {telephone: newUserRequest.telephone},
    });

    if (foundUser) {
      throw new HttpErrors.Unauthorized('Un candidat avec ce numero de telephone existe dejà.');
    }
      // Tout nouvel utilisateur a pour rôle "user" par defaut
        newUserRequest.roles.push('user');
    // encrypter le mot de passe
    const password = await this.passwordHasher.hashPassword(
      newUserRequest.password,
    );
    // creer un nouvel utilisateur sans mot de passe
    const savedUser = await this.userRepository.create(
      _.omit(newUserRequest, 'password'),
    );

    // creer le mot de passe du nouvel utilisateur et l'affecter à userCredentials 
    await this.userRepository.userCredentials(savedUser.id).create({password});

     //convertir un Utilisateur en un objet de type Userprofile :
    // profile minimum de l'utilisateur juste avec quelques proprietes
    
    const userProfile = this.userService.convertToUserProfile(savedUser);

    // generer a JSON Web Token base sur Userprofile
    const token = await this.jwtService.generateToken(userProfile);
 //  retourner le token.
    return {token};
  }


  /**
   * authentification d'un candidat en renseinant son telephone et son mot de passe
   * @param credentials 
   */
  @post('/candidats/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
  //  @requestBody(CredentialsRequestBody) 
    @requestBody({
      description: 'The input of login function',
      required: true,
      // content: {
      //       'application/json': {schema: CredentialsSchema},
      //     },
        
            content: {
              'application/json': {
                schema: getModelSchemaRef(NewUserRequest, {
                  title: 'LoginUser',
                  exclude: ['id'],
                }),
              },
            },

    })
    credentials: Credentials,
  ): Promise<{token: string}> {
    //s'assurer  si l'utilisateur et que son mot de passe soit correct
    const user = await this.userService.verifyCredentials(credentials);

     //convertir un Utilisateur en un objet de type Userprofile :
    // profile minimum de l'utilisateur juste avec quelques proprietes
    const userProfile = this.userService.convertToUserProfile(user);

    // generer a JSON Web Token base sur Userprofile
    const token = await this.jwtService.generateToken(userProfile);
  // retourner le token.
    return {token};
  }

   
  /** obtenir la liste des candidats 
   * après s'être authentifier
  */
  @get('/candidats', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Candidat model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support', 'user'],
    voters: [basicAuthorization],
  })
  async find(
  ): Promise<User[]> {
    return this.userRepository.find();
  }


/**
 * obtenir les données d'un candidat avec son id
 * @param id 
 */
  @get('/candidats/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Candidat model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support', 'user'],
    voters: [basicAuthorization],
  })
  async findById(
    @param.path.string('id') id: string,
  ): Promise<User> {
    return this.userRepository.findById(id);
  }

/** supprimer un candidat
   * après s'être authentifier
   * et seul l'admin peut supprimer
  */
  @del('/candidats/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Candidat DELETE success',
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin'],
    voters: [basicAuthorization],
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
