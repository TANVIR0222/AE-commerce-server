import ProductModel from "../model/product.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


const addProduct = asyncHandler(async (req, res) => {
    const { name, description, price, oldPrice, image, category, subCategory, colors, rating, sizes} = req.body;
  
    if (
          ![name || description || price || oldPrice || image || category || subCategory || colors || rating || sizes]                                            // Check sizes array
      ) {
        return res.status(400).json(new ApiResponse(401, {}, 'Please fill in all fields'));
      }
      

    const productData = {
        name,
        description,
        price,
        oldPrice,
        image,
        category,
        subCategory,
        colors,
        rating,
        sizes
    }

    const product = await ProductModel.create(productData)

    res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
})


const getAllProduct = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", category, subCategory, colors, sizes, minPrice, maxPrice } = req.query;
  
  const matchConditions = [];

  // search product 
  if (search) {
    const searchRegex = new RegExp(search, 'i'); // Match partial strings or patterns, enhancing search functionality.
    matchConditions.push({
      // Match the name, description, or category fields against the search query.
      $or: [
        { name: searchRegex },
        { description: searchRegex },
      ],
    });
  }

  //  filter by category
  if (category) matchConditions.push({ category });
  // filter by subCategory
  if (subCategory) matchConditions.push({ subCategory });

  if (colors) {
    const colorArray = colors.split(",").filter(Boolean);  //removes any empty strings from the resulting array, avoiding issues where extra commas or empty inputs are provided
    if (colorArray.length) matchConditions.push({ colors: { $in: colorArray } }); 
  }

  if (sizes) {
    const sizeArray = sizes.split(",").filter(Boolean);
    //  ensures that the filter is added only if there are valid colors in the array
    if (sizeArray.length) matchConditions.push({ sizes: { $in: sizeArray } }); //  uses the $in operator to match any of the colors in the array against the colors field in the database
  }

  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice); //if (Object.keys(priceFilter).length > 0) matchConditions.push({ price: priceFilter });
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    //  is a built-in JavaScript method that returns an array of a given object's own enumerable property names (keys) returns an array of keys: ['name', 'age', 'job'].
    if (Object.keys(priceFilter).length > 0) matchConditions.push({ price: priceFilter });
  }

  //  filter by category etc or not 
  const matchStage = matchConditions.length ? { $and: matchConditions } : {};

  const pipeline = [
    ...(matchConditions.length ? [{ $match: matchStage }] : []),
    // last add product view first 
    { $sort: { createdAt: -1 } },
    //
    {
      $facet: { // Runs multiple aggregation pipelines concurrently and returns an object containing the result of each pipeline.
        metadata: [{ $count: "total" }],  // Apply all filters
        products: [{ $skip: (page - 1) * parseInt(limit) }, { $limit: parseInt(limit) }], // Paginate results
      },
    },
    {
      $project: {
        // Extracts the 'total' count from 'metadata' // arrayElemAt -> This operator extracts a specific element from an array
        total: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] }, // is empty or null, it returns a default value of 0.
        products: 1,
      },
    },
  ];

  const result = await ProductModel.aggregate(pipeline);
  const products = result[0]?.products || [];
  const total = result[0]?.total || 0;

  res.status(200).json(new ApiResponse(200, { products, total, page, limit }, 'Products retrieved successfully'));
});


// const getAllProduct = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 10, search = "", category, subCategory, colors, sizes, minPrice, maxPrice } = req.query;

//   const matchStage = {
//     // Combines multiple conditions. Each condition is an object representing a field and its corresponding filter
//     $and:[
//       search ? {
//         //  $or multipul conditions 
//         $or:[
//           {name: new RegExp(search, 'i')},
//           {description: new RegExp(search, 'i')},
//         ]
//       }  : {},
//       //  Filter by category
//       category ? {category} : {},
//       subCategory ? {subCategory} : {},
//       // $in: A MongoDB operator that checks if a field’s value matches any value in an array.
//       // It is commonly used when you want to filter for multiple possible matches in a single query condition
//       colors ? {colors :{ $in : colors.split(",") } } : {},
//       // sizes.split(",")   ["m", "L", "x"]
//       sizes ? {sizes : { $in : sizes.split(",") } } : {},
//       // minPrice and maxPrice are typically query parameters for filtering products by price
//       minPrice || maxPrice ? {
//         price:{
//          ...(minPrice && {$get : parseInt(minPrice)}), // Add $gte if minPrice exists
//          ...(maxPrice && {$let : parseInt(maxPrice)}), // // Add $lte if maxPrice exists
//         }
//       } : {}
//     ].filter((condition) => Object.keys(condition).length > 0) // Remove any empty conditions // when building dynamic query objects, especially for MongoDB queries. Here’s a breakdown of its purpose
//   };

//   const pipeline = [
//     { $match: matchStage },  // Apply all filters
//     { $sort: { createdAt: -1 } },  // Sort by most recent
//     // Runs multiple aggregation pipelines concurrently and returns an object containing the result of each pipeline.
//     {
//       $facet: { 
//         metadata: [{ $count: "total" }],  // Count total products
//         products: [{ $skip: (page - 1) * limit }, { $limit: parseInt(limit) }],  // Paginate results
//       }
//     },
//     {
//       // Simplifies the Final Output: It removes unnecessary nested structures
//       $project: {
//         total: { $arrayElemAt: ["$metadata.total", 0] }, // Extracts the 'total' count from 'metadata'
//         products: 1,
//       }
//     }
//   ];

//   const result = await ProductModel.aggregate(pipeline);
//   const products = result[0]?.products || [];
//   const total = result[0]?.total || 0;

//   res.status(200).json(new ApiResponse(200, { products, total, page, limit }, 'Products retrieved successfully'));
// });

const getSingleProductById = asyncHandler( async(req,res) => {
  const { id } = req.params;

  const product = await ProductModel.findById(id).lean(); // Use lean() for better performance if read-only
  if (!product) return res.status(404).json(new ApiResponse(404, null, 'Product not found'));
  
  res.status(200).json(new ApiResponse(200, product, 'Product retrieved successfully'));
})




export { addProduct  , getAllProduct , getSingleProductById}  ;  //export the function 