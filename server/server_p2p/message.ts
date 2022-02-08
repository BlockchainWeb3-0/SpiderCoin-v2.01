import GlobalVar from "../blockchain/globalVar";

enum MessageType {
	QUERY_LAST_BLOCK,
	QUERY_ALL_BLOCK,
	RESPONSE_BLOCKCHAIN,
	QUERY_TRANSACTION_POOL,
	RESPONSE_TRANSACTION_POOL,
}

class Message {
	public type: MessageType;
	public data: any;
	constructor(type: MessageType, data: any) {
		this.type = type;
		this.data = data;
	}

	static queryLastBlock = (): Message => ({
		type: MessageType.QUERY_LAST_BLOCK,
		data: null,
	});
	
	static queryAllBlocks = (): Message => ({
		type: MessageType.QUERY_ALL_BLOCK,
		data: null,
	});
	
	static responseLastBlock = (): Message => ({
		type: MessageType.RESPONSE_BLOCKCHAIN,
		data: JSON.stringify([GlobalVar.blockchain.getLastBlock()]),
	});
	
	static responseAllBlocks = (): Message => ({
		type: MessageType.RESPONSE_BLOCKCHAIN,
		data: JSON.stringify([GlobalVar.blockchain.blocks]),
	});

  static queryTxpool = (): Message => ({
    type: MessageType.QUERY_TRANSACTION_POOL,
    data: null,
  })

  static responseTxpool = (): Message => ({
    type: MessageType.RESPONSE_TRANSACTION_POOL,
    data: JSON.stringify(GlobalVar.txpool.txList),
  })
}

export {Message, MessageType}