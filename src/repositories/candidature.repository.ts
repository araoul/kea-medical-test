import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {Candidature, CandidatureRelations, User, Poste} from '../models';
import {DbkeamedicaltestDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {UserRepository} from './user.repository';
import {PosteRepository} from './poste.repository';

export class CandidatureRepository extends DefaultCrudRepository<
  Candidature,
  typeof Candidature.prototype.candidatureId,
  CandidatureRelations
> {

  public readonly user: HasOneRepositoryFactory<User, typeof Candidature.prototype.candidatureId>;

  public readonly poste: HasOneRepositoryFactory<Poste, typeof Candidature.prototype.candidatureId>;

  constructor(
    @inject('datasources.dbkeamedicaltest') dataSource: DbkeamedicaltestDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('PosteRepository') protected posteRepositoryGetter: Getter<PosteRepository>,
  ) {
    super(Candidature, dataSource);
    this.poste = this.createHasOneRepositoryFactoryFor('poste', posteRepositoryGetter);
    this.registerInclusionResolver('poste', this.poste.inclusionResolver);
    this.user = this.createHasOneRepositoryFactoryFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
