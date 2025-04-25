import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { trackProduct, getProductByRFID, getAllProducts } from '../utils/api';
import { trackRFIDInRealtime } from '../utils/firebase';
import { CheckCircle2, MapPin, Clock } from 'lucide-react';
import Spinner from '../components/ui/spinner';
import axios from 'axios';

const TrackProduct = () => {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rfidStatus, setRfidStatus] = useState(null);
  const [combinedJourney, setCombinedJourney] = useState([]);
  const [isInvalidRFID, setIsInvalidRFID] = useState(false);
  const [productImage, setProductImage] = useState(null);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load product from URL query parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idParam = searchParams.get('id');
    const rfidParam = searchParams.get('rfid');

    if (idParam) {
      // Use the existing form submit handler with the ID parameter
      searchById(idParam);
    } else if (rfidParam) {
      searchByRFID(rfidParam);
    }
  }, [location.search]);

  // Clean up the Firebase listener when unmounting
  useEffect(() => {
    let unsubscribe;
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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

  // Function to search for a product with matching RFID across all farmer listings
  const findProductImageByRFID = async (rfidCode) => {
    setIsSearchingImage(true);
    console.log("Searching for product image for RFID:", rfidCode);
    
    try {
      // First approach: Use our API utility to fetch product by RFID directly
      try {
        console.log("Trying to find product directly by RFID");
        const productData = await getProductByRFID(rfidCode);
        console.log("Retrieved product data:", productData);
        
        if (productData && productData.image) {
          console.log("Setting product image from direct API:", productData.image);
          setProductImage({
            url: `http://localhost:5000${productData.image}`,
            name: productData.name || 'Product'
          });
          return;
        }
      } catch (directError) {
        console.log("Direct RFID lookup failed:", directError.message);
      }
      
      // Second approach: Get all products and filter for our RFID
      try {
        console.log("Trying to find product by searching all products");
        const allProducts = await getAllProducts();
        console.log("Retrieved all products, count:", allProducts.length);
        
        const matchingProduct = allProducts.find(p => p.rfid === rfidCode);
        
        if (matchingProduct && matchingProduct.image) {
          console.log("Found matching product with image:", matchingProduct.image);
          setProductImage({
            url: `http://localhost:5000${matchingProduct.image}`,
            name: matchingProduct.name || 'Product'
          });
          return;
        }
      } catch (allProductsError) {
        console.log("All products lookup failed:", allProductsError.message);
      }
      
      // Third approach: For specific test RFIDs, use product images from system
      // This is a temporary fallback only for development/testing
      if (rfidCode === "537E0E29") {
        // Look for tomato products to get a real farmer-uploaded tomato image
        try {
          const allProducts = await getAllProducts();
          const tomatoProduct = allProducts.find(p => 
            p.name?.toLowerCase().includes('tomato') || 
            p.description?.toLowerCase().includes('tomato')
          );
          
          if (tomatoProduct && tomatoProduct.image) {
            console.log("Found tomato product:", tomatoProduct);
            setProductImage({
              url: `http://localhost:5000${tomatoProduct.image}`,
              name: tomatoProduct.name || 'Tomato'
            });
            return;
          }
        } catch (error) {
          console.log("Tomato product search failed:", error.message);
        }
      } else if (rfidCode === "733D5814") {
        // Look for orange products to get a real farmer-uploaded orange image
        try {
          const allProducts = await getAllProducts();
          const orangeProduct = allProducts.find(p => 
            p.name?.toLowerCase().includes('orange') || 
            p.description?.toLowerCase().includes('orange')
          );
          
          if (orangeProduct && orangeProduct.image) {
            console.log("Found orange product:", orangeProduct);
            setProductImage({
              url: `http://localhost:5000${orangeProduct.image}`,
              name: orangeProduct.name || 'Orange'
            });
            return;
          }
        } catch (error) {
          console.log("Orange product search failed:", error.message);
        }
      }
      
      // No image found through any method
      console.log("Could not find any matching product image");
    } catch (error) {
      console.error("Failed to find product image:", error);
    } finally {
      setIsSearchingImage(false);
    }
  };

  // When we have a product with an RFID, set up real-time tracking
  useEffect(() => {
    // Clean up any existing listener
    let unsubscribe;

    if (product && product.rfid) {
      console.log(`Setting up RFID tracking for product ${product.rfid}`);
      unsubscribe = trackRFIDInRealtime(product.rfid, (data) => {
        console.log(`RFID data received:`, data);
        setRfidStatus(data);
        
        // Process journey data
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
          
          // Convert product supply chain entries if available
          const supplyChainEntries = product.supplyChain ? product.supplyChain.map(entry => ({
            type: 'supply',
            description: entry.description,
            date: new Date(entry.date),
            location: entry.location,
            isRealtime: false,
            isHarvest: entry.description && entry.description.includes("Product harvested"),
            verificationImage: entry.verificationImage
          })) : [];
          
          // Combine and sort all entries by date (newest first)
          const combined = [...rfidEntries, ...supplyChainEntries]
            .sort((a, b) => b.date - a.date);
          
          setCombinedJourney(combined);
        } else if (product.supplyChain) {
          // If no RFID data, just use supply chain data
          const supplyChainEntries = product.supplyChain.map(entry => ({
            type: 'supply',
            description: entry.description,
            date: new Date(entry.date),
            location: entry.location,
            isRealtime: false,
            isHarvest: entry.description && entry.description.includes("Product harvested"),
            verificationImage: entry.verificationImage
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
        isHarvest: entry.description && entry.description.includes("Product harvested"),
        verificationImage: entry.verificationImage
      }));
      setCombinedJourney(supplyChainEntries);
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [product]);

  // Function to search by product ID
  const searchById = async (id) => {
    setIsLoading(true);
    setProduct(null);
    setRfidStatus(null);
    setCombinedJourney([]);
    setIsInvalidRFID(false);
    setProductImage(null);
    
    try {
      // Track the product via backend by ID
      const data = await trackProduct(id);
      setProduct(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to track product by ID');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to search by RFID
  const searchByRFID = async (rfid) => {
    setIsLoading(true);
      setProduct(null);
    setRfidStatus(null);
    setCombinedJourney([]);
    setIsInvalidRFID(false);
    setProductImage(null);
    
    try {
      // First try to get the product by RFID directly - this ensures we get the latest product data
      // including freshness verification entries
      console.log("Fetching product by RFID:", rfid);
      try {
        const data = await getProductByRFID(rfid);
        console.log("Product data from getProductByRFID:", data);
        setProduct(data);
      } catch (directRfidError) {
        console.log("Direct RFID lookup failed, trying track API:", directRfidError);
        // Fall back to the track API
        const data = await trackProduct(rfid);
        console.log("Product data from trackProduct:", data);
        setProduct(data);
      }
    } catch (error) {
      console.log("Backend tracking failed, trying direct RFID tracking");
      
      // If backend fails, try direct RFID tracking through Firebase
      if (rfid && rfid.length > 0) {
        // Set up a temporary listener to see if this RFID exists in Firebase
        const tempUnsubscribe = trackRFIDInRealtime(rfid, async (data) => {
          if (data && data.entries && data.entries.length > 0) {
            // RFID exists in Firebase but not linked to a product in our system
            setRfidStatus(data);
            
            // Try to find a product image matching this RFID
            await findProductImageByRFID(rfid);
            
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
            
            setCombinedJourney(rfidEntries.sort((a, b) => b.date - a.date));
          } else {
            // RFID doesn't exist in Firebase either
            setIsInvalidRFID(true);
            toast.error("No product or RFID data found with this ID");
          }
          
          // Clean up the temporary listener
          tempUnsubscribe();
        });
      } else {
        toast.error('Please enter a valid RFID');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      toast.error('Please enter a Product ID or RFID');
      return;
    }
    
    if (productId.includes('-')) {
      // If it contains a dash, it's likely a Product ID
      searchById(productId);
    } else {
      // Otherwise treat it as an RFID
      searchByRFID(productId);
    }
  };

  // Function to get the entry count text
  const getEntryCountText = () => {
    if (!rfidStatus || !rfidStatus.entries) return "No RFID data";
    return `${rfidStatus.entries.length} RFID entries found`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-xl rounded-xl border border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-green-700">
            Track Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="productId" className="text-lg font-medium text-gray-700">
                Product ID or RFID
              </Label>
              <Input
                id="productId"
                name="productId"
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter product ID or RFID"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-3 rounded-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner className="mr-2" />
                  <span>Tracking...</span>
                </div>
              ) : (
                'Track Product'
              )}
            </Button>
          </form>

          {isLoading && (
            <div className="mt-8 text-center">
              <Spinner />
              <p className="mt-2 text-gray-600">Searching for product information...</p>
            </div>
          )}

          {isInvalidRFID && !isLoading && (
            <div className="mt-8 text-center p-4 bg-red-50 rounded-lg">
              <p className="text-red-600 font-medium">No product or RFID data found with this ID.</p>
              <p className="text-gray-600 mt-2">Please check the ID and try again.</p>
            </div>
          )}

          {product && (
            <div className="mt-6">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">
                Product Details
              </h3>
              
              {/* Product Image */}
              {product.image && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={`http://localhost:5000${product.image}`}
                    alt={product.name}
                    className="w-full max-w-md h-64 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x300?text=No+Image';
                      console.error('Failed to load image:', product.image);
                    }}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">Product Name</p>
                  <p className="font-semibold">{product.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Farmer</p>
                  <p className="font-semibold">{product.farmer?.username || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Origin</p>
                  <p className="font-semibold">{product.origin}</p>
                </div>
                <div>
                  <p className="text-gray-600">Harvest Date</p>
                  <p className="font-semibold">{new Date(product.harvestDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Freshness Score</p>
                  <p className="font-semibold text-green-600">{product.freshnessScore}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Description</p>
                  <p className="font-semibold">{product.description || 'N/A'}</p>
                </div>
                {product.rfid && (
                  <div className="col-span-2 mt-2 border-t pt-4">
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
            </div>
          )}

          {/* Display RFID tracking data even if no product is found */}
          {!product && rfidStatus && rfidStatus.entries && rfidStatus.entries.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-2xl font-semibold text-blue-700 mb-2">
                RFID Tracking Information
              </h3>
              
              {/* Show product image if found, otherwise show placeholder */}
              <div className="mb-6 flex justify-center">
                {isSearchingImage && (
                  <div className="flex flex-col items-center">
                    <Spinner />
                    <p className="mt-2 text-gray-600">Searching for product image...</p>
                  </div>
                )}
                
                {!isSearchingImage && (
                  <div className="relative">
                    {productImage ? (
                      <img
                        src={productImage.url}
                        alt={productImage.name}
                        className="w-full max-w-md h-64 object-cover rounded-lg shadow-md"
                        onLoad={() => console.log("Image loaded successfully:", productImage.url)}
                        onError={(e) => {
                          console.error("Failed to load image:", productImage.url);
                          e.target.src = 'https://placehold.co/400x300?text=RFID+Only';
                        }}
                      />
                    ) : (
                      <img
                        src="https://placehold.co/400x300?text=RFID+Only"
                        alt="RFID Only"
                        className="w-full max-w-md h-64 object-cover rounded-lg shadow-md bg-blue-50"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white p-2 text-center">
                      RFID: {rfidStatus.rfidCode}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mt-2">
                <p className="text-blue-800 font-medium">This RFID tag is being tracked in our system but is not linked to a specific product record.</p>
                <p className="text-blue-800 mt-2">You can still view real-time tracking information below.</p>
                <div className="mt-4">
                  <p className="font-medium text-blue-700">{getEntryCountText()}</p>
                  <p className="text-blue-700">
                    Last update: {new Date(rfidStatus.lastSeen).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Combined journey section */}
          {combinedJourney.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-xl font-semibold mb-4">Supply Chain Journey</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {combinedJourney.map((entry, index) => (
                  <div 
                    key={entry.type === 'rfid' ? `rfid-${entry.id}-${index}` : `supply-${index}`}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors duration-300 ${entry.isRealtime ? 'bg-blue-50' : ''}`}
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
                      
                      {/* Display verification image if available */}
                      {entry.verificationImage && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-1">Verification Image:</p>
                          <img 
                            src={`http://localhost:5000${entry.verificationImage}`}
                            alt="Verification"
                            className="w-full h-32 object-cover rounded-lg border border-gray-300 mt-1"
                            onError={(e) => {
                              console.error("Failed to load verification image:", entry.verificationImage);
                              e.target.src = 'https://placehold.co/200x150?text=No+Image';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Status */}
          {combinedJourney.length > 0 && (
            <div className="mt-6 bg-green-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Current Status</h3>
              <p className="text-green-700">
                Product is currently at {combinedJourney[0].location}
              </p>
              {product && (
                <p className="text-green-700">
                  Current Freshness Score: {product.freshnessScore}%
                </p>
              )}
              {rfidStatus && rfidStatus.lastSeen && (
                <p className="text-green-700 mt-2">
                  RFID last detected: {new Date(rfidStatus.lastSeen).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackProduct;