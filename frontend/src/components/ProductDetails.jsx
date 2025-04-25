import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { CheckCircle2, MapPin, Clock } from 'lucide-react';
import { trackRFIDInRealtime } from '../utils/firebase';

const ProductDetails = ({ product, onClose }) => {
    const [rfidStatus, setRfidStatus] = useState(null);
    const [combinedJourney, setCombinedJourney] = useState([]);
    
    useEffect(() => {
        console.log("Product received:", product);
        let unsubscribe;
        if (product && product.rfid) {
            unsubscribe = trackRFIDInRealtime(product.rfid, (data) => {
                console.log(`RFID data received for ${product.rfid}:`, data);
                setRfidStatus(data);
                
                // Combine RFID journey with supply chain data
                if (data && data.entries && data.entries.length > 0) {
                    // Convert RFID entries to journey format
                    const rfidEntries = data.entries.map(entry => ({
                        type: 'rfid',
                        id: entry.id,
                        description: `RFID scanned at Location ${entry.location}`,
                        date: new Date(entry.timestamp),
                        location: `Location ${entry.location}`,
                        timestamp: entry.timestamp,
                        isRealtime: true
                    }));
                    
                    console.log("Converted RFID entries:", rfidEntries);
                    
                    // Convert product supply chain entries if available
                    const supplyChainEntries = product.supplyChain ? product.supplyChain.map(entry => ({
                        type: 'supply',
                        description: entry.description,
                        date: new Date(entry.date),
                        location: entry.location,
                        isRealtime: false,
                        isHarvest: entry.description && entry.description.includes("Product harvested")
                    })) : [];
                    
                    // Combine and sort all entries by date (newest first)
                    const combined = [...rfidEntries, ...supplyChainEntries]
                        .sort((a, b) => b.date - a.date);
                    
                    console.log("Combined journey entries:", combined);
                    setCombinedJourney(combined);
                } else if (product.supplyChain) {
                    // If no RFID data, just use supply chain data
                    const supplyChainEntries = product.supplyChain.map(entry => ({
                        type: 'supply',
                        description: entry.description,
                        date: new Date(entry.date),
                        location: entry.location,
                        isRealtime: false,
                        isHarvest: entry.description && entry.description.includes("Product harvested")
                    }));
                    setCombinedJourney(supplyChainEntries);
                }
            });
        } else if (product && product.supplyChain) {
            // If no RFID, just use supply chain data
            const supplyChainEntries = product.supplyChain.map(entry => ({
                type: 'supply',
                description: entry.description,
                date: new Date(entry.date),
                location: entry.location,
                isRealtime: false,
                isHarvest: entry.description && entry.description.includes("Product harvested")
            }));
            setCombinedJourney(supplyChainEntries);
        }
        
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [product]);
    
    // Helper function to format dates appropriately
    const formatDate = (date, isHarvest) => {
        if (isHarvest) {
            // For harvest entries, only show the date without the time
            return date.toLocaleDateString();
        } else {
            // For other entries, show the full date and time
            return date.toLocaleString();
        }
    };
    
    // Debug function to show entry count
    const getEntryCountText = () => {
        if (!rfidStatus || !rfidStatus.entries) return "No RFID data";
        return `${rfidStatus.entries.length} RFID entries found`;
    };
    
    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-full max-w-2xl mx-4">
                <Card className="bg-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold">Product Information</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div>
                                <p className="text-gray-600">Product Name</p>
                                <p className="font-semibold">{product.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Farmer</p>
                                <p className="font-semibold">{product.farmer?.username || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Harvest Date</p>
                                <p className="font-semibold">{new Date(product.harvestDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Initial Freshness Score</p>
                                <p className="font-semibold text-green-600">{product.freshnessScore}%</p>
                            </div>
                            {product.rfid && (
                                <div className="col-span-2">
                                    <p className="text-gray-600 mb-1">RFID Tracking</p>
                                    <div className="flex items-center">
                                        <p className="font-semibold mr-2">{product.rfid}</p>
                                        {rfidStatus && rfidStatus.entries && rfidStatus.entries.length > 0 ? (
                                            <span className="flex items-center text-green-600">
                                                <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                                Tracked in real-time ({getEntryCountText()})
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-gray-400">
                                                <span className="inline-block h-2 w-2 rounded-full bg-gray-300 mr-2"></span>
                                                Waiting for tracking data...
                                            </span>
                                        )}
                                    </div>
                                    {rfidStatus && rfidStatus.lastSeen && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Last update: {new Date(rfidStatus.lastSeen).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">Supply Chain Journey</h3>
                            {combinedJourney.length > 0 ? (
                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                    {combinedJourney.map((entry, index) => (
                                        <div 
                                            key={entry.type === 'rfid' ? `rfid-${entry.id}-${index}` : `supply-${index}`}
                                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors duration-300 ${entry.isRealtime ? 'bg-green-50 animate-pulse-once' : ''}`}
                                        >
                                            {entry.type === 'rfid' ? (
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                            ) : (
                                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                                            )}
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className={`font-semibold ${entry.isRealtime ? 'text-blue-600' : ''}`}>
                                                        {entry.description}
                                                        {entry.isRealtime && (
                                                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                                Real-time
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {formatDate(entry.date, entry.isHarvest)}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {entry.location}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No journey data available
                                </p>
                            )}
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">Current Status</h3>
                            <p className="text-green-700">
                                Product is currently at {
                                    combinedJourney.length > 0 
                                        ? combinedJourney[0].location 
                                        : product.supplyChain?.[product.supplyChain.length - 1]?.location || 'Unknown'
                                }
                            </p>
                            <p className="text-green-700">
                                Current Freshness Score: {product.freshnessScore}%
                            </p>
                            {product.rfid && rfidStatus && rfidStatus.lastSeen && (
                                <p className="text-green-700 mt-2">
                                    RFID last detected: {new Date(rfidStatus.lastSeen).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProductDetails; 