import React from 'react';
import './Home.css';

const Home = () => {

    return (
        <section className="home d-flex flex-column justify-content-center align-items-center">
            <a name="home" href="/" style={{
                position: 'relative',
                top: '0px',
                left: '0px',
                visibility: 'hidden'
            }}>Home</a>
            <h2 className="text-center">Zeke Naulty</h2>
        </section>
    );
};

export default Home;
