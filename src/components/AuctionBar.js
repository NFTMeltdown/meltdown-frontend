import React from 'react';

function AuctionBar(props) {
    return (        
        <div style={{position: "relative"}}>
            <div style={{display: "flex", alignItems: "center", width: "100%"}}>
                <div style={{backgroundColor: "#4971f5", height: "5px", width: `${100 - props.closingPercentage}%`}}>                                
                </div>
                <div style={{backgroundColor: "#ff6700", height: "5px", width: `${props.closingPercentage}%`}}>
                </div>
            </div>
            <div style={{width: "100%", position: 'relative', left: "-4px"}}>
                <div style={{fontSize: "20px", position: "absolute", top: "-15px", left: `${props.progressPercentage}%`}}>
                    |
                </div>
            </div>
        </div>
    )
}

export default AuctionBar;
