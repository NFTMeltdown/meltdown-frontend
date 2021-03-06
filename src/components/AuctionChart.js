import React, { useEffect, useState } from 'react';
import Chart from "react-apexcharts";
import { ellipsisAddress } from '../utilities';

function AuctionChart(props) {
    const [ series, setSeries ] = useState([]);
    const [ categories, setCategories ] = useState([]);
    const [ colorCols, setColorCols ] = useState([]);
    
    useEffect(() => {
        if (
            props.Moralis !== undefined && 
            props.Moralis !== null && 
            props.auctionId !== undefined &&
            props.web3 !== undefined &&
            props.blocks.created !== undefined
        ){
            (async () => {
                await getBidSeriesCaleb();
                const query = new props.Moralis.Query("BidIncreased");
                query.equalTo("auctionId", props.auctionId)
                const subscription = await query.subscribe();
                subscription.on("create", () =>{
                    getBidSeriesCaleb();
                })
            })();
        }
    }, [props.Moralis, props.auctionId, props.isInitialized, props.web3, props.blocks]);


    //divide total auction time into min(blocks, 1000) different segments
    const getBidSeriesCaleb = async() => {
        const query = new props.Moralis.Query("BidIncreased");
        query.ascending("block_number");
        query.equalTo("auctionId", props.auctionId)
        const result = await query.find();

        // fetch unique bidders
        let bidders = [];
        for (let element of result) {
            let bidder = element.attributes.bidder;
            if (bidders.indexOf(bidder) === -1) {
                bidders.push(bidder);
            }
        }

        // pretty sure this should always give us the correct 
        // top five bidders
        let topBidders = [];
        for (var i = 0; i < bidders.length; i++) {
            let bidderTotal = 0;
            for (var j = 0; j < result.length; j++) {
                if (result[j].attributes.bidder === bidders[i]) {
                    bidderTotal += Number(result[j].attributes.amount);
                }
            }
            topBidders.push({bidder: bidders[i], total: bidderTotal});
        }

        topBidders.sort((a, b) => b.total - a.total);
        console.log(topBidders);
        topBidders.slice(0, 5);
        bidders = topBidders.map(bidderObj => bidderObj.bidder);
        let amounts = topBidders.map(bidderObj => bidderObj.total);
        props.setTopBidders(bidders);
        props.setTopAmounts(amounts);

        let seriesArr = bidders.map(bidder => {
            var cum = [];
            for (var i = 0; i < result.length; i++){
                if (result[i].attributes.bidder === bidder) {
                    if(cum.length === 0) {
                        cum.push([result[i].attributes.block_number, 0]);
                    }
                    cum.push([result[i].attributes.block_number, cum[cum.length - 1][1] + Number(result[i].attributes.amount)]);
                }
            }
            cum.push([Math.min(props.blocks.current, props.blocks.final), cum[cum.length-1][1]])
            return {
                name: ellipsisAddress(bidder, 4),
                data: cum
            }
        });
        console.log(seriesArr);
        setSeries(seriesArr);
    }

    return (        
        <div>
            <Chart
                type="line"
                options={{   
                    annotations:{
                        position: "back",
                        xaxis: [
                            {
                                label: {
                                    text:""
                                },
                                x: props.blocks.current,
                                strokeDashArray: 4
                            },

                            {
                                label: {
                                    text:"Auction Start"
                                },
                                x: props.blocks.created,
                            },
                            {
                                label: {
                                    text:"Closing window"
                                },
                                x: props.blocks.closing,
                                x2: props.blocks.final,
                                fillColor: "#f0aa9c"
                            },
                            {
                                label: {
                                    text:"Auction End"
                                },
                                x: props.blocks.final,
                            },
                            {
                                label: {
                                    text: "Winner"
                                },
                                borderColor: '#775DD0',
                                x: props.blocks.winner,
                            }
                        ]
                    },
                    yaxis: {
                        labels:{
                            formatter: function(val, index) {
                                return props.Moralis.Units.FromWei(val) + " ETH";
                            }
                        }
                    },
                    noData: {
                        text: "no bids yet",
                        align: 'center',
                        verticalAlign: 'middle',
                        offsetX: 0,
                        offsetY: 0,
                        style: {
                          fontSize: '25px'
                        }
                    },
                    legend: {
                        show: true
                    },
                    xaxis: {
                        type: 'numeric',
                        min: props.blocks.created,
                        max: props.blocks.final
                    },
                    stroke: {
                        curve: "stepline"
                    },
                    title: {
                        text: "bids",
                        align: "left"
                    },  
                    grid: {
                        padding: {
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 25 
                        }, 
                    }
                }}                
                series={series}
            />
        </div>
    )
}

export default AuctionChart;