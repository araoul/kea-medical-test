import {Entity, model, property, belongsTo, hasOne} from '@loopback/repository';
import {v4 as uuid} from 'uuid';
import { Candidature } from './candidature.model';
import { UserCredentials } from '.';

@model({settings: {strict: true}})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
    default: () => uuid(),
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  nom: string;

  @property({
    type: 'string',
    required: true,
  })
  prenom: string;

  @property({
    type: 'string',
    required: true,
  })
  telephone: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  profession: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  roles?: string[];
  // @property({
  //   type: 'string',
  // })
  // candidatureId?: string;
  @hasOne(() => UserCredentials)
  userCredentials: UserCredentials;

  @belongsTo(() => Candidature)
  candidatureId?: string;
  
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
