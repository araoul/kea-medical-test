import {
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  getModelSchemaRef,
  requestBody,
} from '@loopback/rest';
import {Candidature} from '../models';
import {CandidatureRepository} from '../repositories';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { basicAuthorization } from '../services/basic.authorizor';


export class CandidatureController {
  constructor(
    @repository(CandidatureRepository)
    public candidatureRepository : CandidatureRepository,
  ) {}

  @post('/candidatures/enregistrer', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Candidature model instance',
        content: {'application/json': {schema: getModelSchemaRef(Candidature)}},
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
          schema: getModelSchemaRef(Candidature, {
            title: 'NewCandidature',
            exclude: ['id'],
          }),
        },
      },
    })
    candidature: Omit<Candidature, 'id'>,
  ): Promise<Candidature> {
    return this.candidatureRepository.create(candidature);
  }



}
