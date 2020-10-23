import {
  repository,
} from '@loopback/repository';
import {
  post,
  get,
  getModelSchemaRef,
  requestBody,
} from '@loopback/rest';
import {Poste} from '../models';
import {PosteRepository} from '../repositories';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';

export class PosteController {
  constructor(
    @repository(PosteRepository)
    public posteRepository : PosteRepository,
  ) {}

  /**
   * Sauvegarder un poste
   * @param poste 
   */
  @post('/postes/enregistrer', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Poste model instance',
        content: {'application/json': {schema: getModelSchemaRef(Poste)}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({
    allowedRoles: ['admin', 'support', 'user'],
    voters: [basicAuthorization],
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Poste, {
            title: 'NewPoste',
            exclude: ['posteId'],
          }),
        },
      },
    })
    poste: Omit<Poste, 'posteId'>,
  ): Promise<Poste> {
    poste.datePublication = new Date();
    return this.posteRepository.create(poste);
  }

  /**
   * Obtenir la liste des postes
   */
  @get('/postes', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Poste model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Poste, {includeRelations: true}),
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
  ): Promise<Poste[]> {
    return this.posteRepository.find();
  }

}
