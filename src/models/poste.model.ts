import {Entity, model, property, belongsTo} from '@loopback/repository';
import {v4 as uuid} from 'uuid';
import { Candidature } from '.';

@model({settings: {strict: true}})
export class Poste extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
    default: () => uuid(),
  })
  posteId: string;

  @property({
    type: 'string',
    required: true,
  })
  libelle: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
  })
  experience?: string;

  @property({
    type: 'string',
    required: true,
  })
  diplome: string;

  @property({
    type: 'number',
    required: true,
  })
  place: number;

  @property({
    type: 'date',
    required: true,
  })
  datePublication: string;

  @property({
    type: 'date',
    required: true,
  })
  dateExpiration: string;

  // @property({
  //   type: 'string',
  // })
  // candidatureId?: string;

  
  @belongsTo(() => Candidature)
  candidatureId?: string;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Poste>) {
    super(data);
  }
}

export interface PosteRelations {
  // describe navigational properties here
}

export type PosteWithRelations = Poste & PosteRelations;
