import merkle from "merkle";

import { Block, BlockHeader } from "./block";
import { Transaction } from "./transaction";

export const INITIAL_DIFFICULTY = 3;
export const DIFFICULTY_ADJUSTMENT_INTERVAL_SECOND = 10; // second
export const DIFFICULTY_ADJUSTMENT_INTERVAL_BLOCK = 10; // blocks

export const genesisTransactionData: Transaction = {
  txIns: [{'signature': '', 'txOutId': '', 'txOutIndex': 0}],
  txOuts: [{
      'address': '04875a5ee53110a1ce856f2fc549671456afcc62a510d96cb8e05ca0cb65f78c0b1fb880db8ac195cee93d2d6eff917e795f224d63a2c73319b1ce1e42f27395a4',
      'amount': 50
  }],
  id: 'ff21efb83712a97c5bab8babbf5e7e6b3af9fce90aae1fcf5dbe45e753e594ba'
};
