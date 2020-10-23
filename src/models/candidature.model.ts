import {Entity, model, property, hasOne} from '@loopback/repository';
import {v4 as uuid} from 'uuid';
import {User} from './user.model';
import {Poste} from './poste.model';

@model({settings: {strict: true}})
export class Candidature extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
    default: () => uuid(),
  })
  candidatureId: string;

  @property({
    type: 'string',
    required: true,
  })
  cv: string;

  @hasOne(() => User)
  user: User;

  @hasOne(() => Poste)
  poste: Poste;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Candidature>) {
    super(data);
  }
}

export interface CandidatureRelations {
  // describe navigational properties here
}

export type CandidatureWithRelations = Candidature & CandidatureRelations;
