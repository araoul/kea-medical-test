import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {UserCredentialsRepository} from './user-credentials.repository';
import {User, UserRelations, UserCredentials} from '../models';
import {DbkeamedicaltestDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';

export type Credentials = {
  telephone: string;
  password: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly userCredentials: HasOneRepositoryFactory<UserCredentials, typeof User.prototype.id>;
  constructor(
    @inject('datasources.dbkeamedicaltest') dataSource: DbkeamedicaltestDataSource, @repository.getter('UserCredentialsRepository') protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>,
  ) {
    super(User, dataSource);
    this.userCredentials = this.createHasOneRepositoryFactoryFor('userCredentials', userCredentialsRepositoryGetter);
    this.registerInclusionResolver('userCredentials', this.userCredentials.inclusionResolver);
  }

  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    try {
      return await this.userCredentials(userId).get();
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }
}
