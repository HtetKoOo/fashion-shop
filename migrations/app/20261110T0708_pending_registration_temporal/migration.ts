#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1511afa8a087defcd34514ed92ab820fd816bd5541547d86cfa34f6457f85b74/contract';
import startContract from '../../snapshots/1511afa8a087defcd34514ed92ab820fd816bd5541547d86cfa34f6457f85b74/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/4ed2c2a0275ea4f38a2539c247ec7a2605b07788291457b02590feaae22a44ac/contract';
import endContract from '../../snapshots/4ed2c2a0275ea4f38a2539c247ec7a2605b07788291457b02590feaae22a44ac/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [];
  }
}

MigrationCLI.run(import.meta.url, M);
