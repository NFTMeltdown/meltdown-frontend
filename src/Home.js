import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import MiniViewAuction from './components/MiniViewAuction';
import FeaturedAuction from './components/FeaturedAuction';

const LazyMiniAuction = React.lazy(() => import('./components/MiniViewAuction'));

const DisplayMiniAuction = props => (
    <Suspense fallback={<MiniViewAuction id="" image="" />}>
        <LazyMiniAuction {...props} />
    </Suspense>
)

function Home(props) {
    const [ loadedAuctions, setLoadedAuctions ] = useState([]);

    const getDisplayAuctions = async () => {
        const query = new props.Moralis.Query("auctions");
        const result = await query.find();
        setLoadedAuctions(result);
    }

    useEffect(() => {
        if (props.isInitialized === true && loadedAuctions.length === 0) {
            (async () => {
                await getDisplayAuctions();
            })();
        }
    }, [props.isInitialized]);

    return (
        <div>
            <div>
                <h1 className="heading">
                    Featured Auction
                </h1>
            </div>
            <div style={{display: "inline-block"}}>
                <FeaturedAuction
                    data={props.featuredNft}
                    Moralis={props.Moralis}
                    isInitialized={props.isInitialized}
                    web3={props.web3}
                />
            </div>
            <div>
                <h1 className="heading" id='liveAuctions'>Live auctions</h1>
                <div style={{textAlign: "left"}}>
                    {loadedAuctions.map(auction => {
                        return (
                            <DisplayMiniAuction
                                key={auction.id}
                                id={auction.id}
                                image={auction.attributes.src}
                                closingPercentage={auction.attributes.closing_percentage}
                                progressPercentage={Math.floor(Math.random() * 100)}
                            />
                        )
                    })}                    
                </div>
            </div>            
        </div>
    )
}

export default Home;
