import {DefaultCrudRepository} from '@loopback/repository';
import {Poste, PosteRelations} from '../models';
import {DbkeamedicaltestDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class PosteRepository extends DefaultCrudRepository<
  Poste,
  typeof Poste.prototype.posteId,
  PosteRelations
> {
  constructor(
    @inject('datasources.dbkeamedicaltest') dataSource: DbkeamedicaltestDataSource,
  ) {
    super(Poste, dataSource);
  }
}
