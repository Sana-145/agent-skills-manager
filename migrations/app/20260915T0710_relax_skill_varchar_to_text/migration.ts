#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1a180e5b40975bd92c8c8e945802618b1b2fea5425ea2c73b97f6297414b0e51/contract';
import endContract from '../../snapshots/1a180e5b40975bd92c8c8e945802618b1b2fea5425ea2c73b97f6297414b0e51/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/ead3cda6249d5ea034ba8b71b532e9236c627379fe6d145e5f6d59c592984ab9/contract';
import startContract from '../../snapshots/ead3cda6249d5ea034ba8b71b532e9236c627379fe6d145e5f6d59c592984ab9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, placeholder } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dataTransform(endContract, 'typechange-skills-description', {
        check: () => placeholder('typechange-skills-description:check'),
        run: () => placeholder('typechange-skills-description:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'skills',
        column: 'description',
        options: {
          qualifiedTargetType: 'text',
          formatTypeExpected: 'text',
          rawTargetTypeForLabel: 'text',
        },
      }),
      this.dataTransform(endContract, 'typechange-skills-name', {
        check: () => placeholder('typechange-skills-name:check'),
        run: () => placeholder('typechange-skills-name:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'skills',
        column: 'name',
        options: {
          qualifiedTargetType: 'text',
          formatTypeExpected: 'text',
          rawTargetTypeForLabel: 'text',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
