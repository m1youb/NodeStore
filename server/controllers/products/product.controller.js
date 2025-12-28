import cloudinary from "../../config/cloudinary.js";
import { redis } from "../../libs/redis.js";
import { dbLogger } from "../../logs/database/database.js";
import Product from "../../model/product.model.js"

export const getProducts = async function (req, res) {
    try {
        const products = await Product.findAll({});
        if (!products) {
            return res.status(404).json({ success: false, message: "Couldn't get products" });
        }
        if (products.length === 0) {
            return res.status(200).json({ success: true, message: "Products database is empty", products: [] });
        }

        // Debug: Log first product image to verify URLs
        if (products.length > 0) {
            console.log('Sample product image URL:', products[0].image);
        }

        return res.status(200).json({ success: true, message: "Succesfully got products", products });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, products: [] })
    }
}

export const createOne = async function (req, res) {
    try {
        const { title, description, price, category, stock_count, specs } = req.body;
        let { image } = req.body;
        if (!title || !description || !price || !category || !image) {
            return res.status(400).json({ success: false, message: "All fields should be filled" });
        }

        const findProduct = await Product.findByTitle(title);
        if (findProduct) {
            return res.status(400).json({ success: false, message: "Can't create product due to existing title, use a different title" });
        }

        if (image) {
            const uploadImage = await cloudinary.uploader.upload(image, { folder: "products" });
            image = uploadImage?.secure_url;
        }

        const newProduct = await Product.create({
            title,
            description,
            price,
            category,
            image,
            stock_count: stock_count || 0,
            specs: specs || []
        });
        return res.status(201).json({ success: true, message: `${title} was saved succesfully`, product: newProduct });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const updateProduct = async function (req, res) {
    try {
        const { id: product } = req.params;
        let { image } = req.body;

        if (!product) {
            return res.status(404).json({ success: false, message: "No identifier was passed", product: null });
        }

        // Validate image size if it's base64 (rough estimate: base64 is ~33% larger than binary)
        if (image && !image.startsWith('http')) {
            const imageSizeInBytes = (image.length * 3) / 4;
            const maxSizeInBytes = 10 * 1024 * 1024; // 10MB limit

            if (imageSizeInBytes > maxSizeInBytes) {
                return res.status(400).json({
                    success: false,
                    message: `Image size (${(imageSizeInBytes / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (10MB). Please compress the image.`
                });
            }

            try {
                const uploaded = await cloudinary.uploader.upload(image, {
                    folder: "products",
                    resource_type: "auto",
                    timeout: 60000 // 60 second timeout
                });
                image = uploaded.secure_url;
                req.body.image = image;
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: `Image upload failed: ${uploadError.message || 'Unknown error'}`
                });
            }
        }

        const findUpdate = await Product.updateById(product, req.body);
        if (!findUpdate) {
            return res.status(404).json({ success: false, message: "Couldn't update due to missing product", product: null })
        }

        return res.status(200).json({ success: true, message: "Product updated succesfully", product: findUpdate })
    } catch (error) {
        console.error("Update product error:", error);
        return res.status(500).json({ success: false, message: error.message || "An unexpected error occurred" });
    }
}

export const deleteProduct = async function (req, res) {
    try {
        const { id: product } = req.params;
        if (!product) {
            return res.status(404).json({ success: false, message: "Id wasn't provided" });
        }

        // Get product first to access image
        const productToDelete = await Product.findById(product);
        if (!productToDelete) {
            return res.status(404).json({ success: false, message: "Couldn't proceed due to missing product" });
        }

        const isDeleted = await Product.deleteById(product);
        if (!isDeleted) {
            return res.status(500).json({ success: false, message: "Failed to delete product" });
        }

        if (productToDelete.image) {
            const imgId = productToDelete.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`products/${imgId}`);
        }
        return res.status(200).json({ success: true, message: `${productToDelete.title} was deleted succesfully` });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const featureProduct = async function (req, res) {
    try {
        const { id: product } = req.params;
        if (!product) {
            return res.status(400).json({ success: false, message: "Couldn't find product" });
        }

        const pro = await Product.toggleFeatured(product);
        if (pro) {
            await updateFeaturedProductsCache();
            return res.status(201).json({ success: true, message: `${pro.title} was featured`, product: pro });
        } else {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

    } catch (error) {
        dbLogger.info("Error: " + error.name + " was found at " + error.trace);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getFeaturedProducts = async function (req, res) {
    try {
        let cachedFeautred = await redis.get("featured_products")
        if (cachedFeautred) {
            return res.status(200).json({ success: true, message: "Retrieval was succesfull", products: JSON.parse(cachedFeautred) });
        }

        const getFeatProd = await Product.getFeaturedProducts();
        if (!getFeatProd) {
            return res.status(400).json({ success: false, message: "Couldn't get products" });
        }
        if (getFeatProd.length === 0) {
            return res.status(200).json({ success: true, message: "There's no featured products", products: [] });
        }

        await redis.set("featured_products", JSON.stringify(getFeatProd));
        return res.status(200).json({ success: true, message: "Retrieval was succesfull", products: getFeatProd });
    } catch (error) {
        dbLogger.info("Error: " + error.name + " was found at " + error.trace);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getSuggestions = async function (req, res) {
    try {
        const recommendations = await Product.getRecommendedProducts(3);

        if (recommendations.length === 0) {
            return res.status(200).json({ success: true, message: "Got suggestions succesfully, but ther's no products", products: [] });
        }

        return res.status(200).json({ success: true, message: "Got suggestions succesfully", products: recommendations });
    } catch (error) {
        dbLogger.info("Error: " + error.name + " was found at " + error.trace);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getProductsCategory = async function (req, res) {
    try {
        const { category } = req.params;
        const { minPrice, maxPrice, inStockOnly, featuredOnly, sortBy } = req.query;

        if (!category) {
            return res.status(400).json({ success: false, message: "Couldn't get products, problem with catagory unprovided", products: null });
        }

        const filters = {
            category,
            minPrice: minPrice ? parseFloat(minPrice) : null,
            maxPrice: maxPrice ? parseFloat(maxPrice) : null,
            inStockOnly: inStockOnly === 'true',
            featuredOnly: featuredOnly === 'true',
            sortBy: sortBy || 'newest'
        };

        const products = await Product.findByCategory(category, filters);
        if (!products) {
            return res.status(400).json({ success: false, message: "Couldn't get products", products: null });
        }
        if (products.length === 0) {
            return res.status(200).json({ success: true, message: "No products in this category", products: [] });
        }

        return res.status(200).json({ success: true, message: "Products retireved succesfully", products });
    } catch (error) {
        dbLogger.info("Error: " + error.name + " was found at " + error.trace);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const updateFeaturedProductsCache = async function (req, res) {
    try {
        const featuredProducts = await Product.getFeaturedProducts();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        dbLogger.info("Error: " + error.name + " was found at " + error.trace);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getById = async function (req, res) {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, message: "Product retrieved successfully", product });
    } catch (error) {
        dbLogger.info("Error: " + error.name + " was found at " + error.trace);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const searchProducts = async function (req, res) {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(200).json({ success: true, message: "No search query provided", products: [] });
        }

        const products = await Product.searchProducts(q.trim(), 5); // Limit to 5 for autocomplete

        return res.status(200).json({
            success: true,
            message: "Search completed successfully",
            products,
            count: products.length
        });
    } catch (error) {
        dbLogger.error("Search error: " + error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}