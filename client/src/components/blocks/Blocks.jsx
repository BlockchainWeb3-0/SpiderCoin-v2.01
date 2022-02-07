import React, { useEffect, useState } from 'react';
import useAxios from '../../hooks/useAxios';
import './Blocks.scss';
import GenesisBlock from './GenesisBlock';
import Block from './Block';

const Blocks = () => {
  const blocks = useAxios({
    method: 'get',
    baseURL: 'http://localhost:3001',
    url: '/blocks',
  });

  const txDataList = [{ tx: 'test' }];


  if (blocks.loading) {
    return (
      <>
        Loading...
      </>
    );
  } else {
    const genesisBlock = blocks.data.blocks[0];
    const restBlocks = blocks.data.blocks.slice(1);

    return (
      <>
        <div className="blocks-container">
          <div className="blockchain">
            <GenesisBlock blockInfo={genesisBlock} />
            {restBlocks.map((block, index) => (
              <Block key={block.hash} blockInfo={block} txData={txDataList} />
            ))}
          </div>
        </div>
      </>
    );
  }
};

export default Blocks;
