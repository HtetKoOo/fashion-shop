#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/5412c36c9ec6fe6fe0369e367a51fa12a91d3d2a465bac87594945065fcd1093/contract';
import startContract from '../../snapshots/5412c36c9ec6fe6fe0369e367a51fa12a91d3d2a465bac87594945065fcd1093/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a27f44036d041d2f461ee3a01b3b86b245b09844cc61a0cc3f54382a999e7fab/contract';
import endContract from '../../snapshots/a27f44036d041d2f461ee3a01b3b86b245b09844cc61a0cc3f54382a999e7fab/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'product',
        column: col('sku', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
