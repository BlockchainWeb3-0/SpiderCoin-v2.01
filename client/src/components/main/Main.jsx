import React from 'react';

const Main = ({children}) => {
  return <>
    <section className="main-contents">
      {children}
    </section>
  </>;
};

export default Main
