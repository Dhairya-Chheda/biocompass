import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';
import wixMembersFrontend from 'wix-members-frontend';
import {getCategories} from 'public/categories'
import * as constants from 'public/constants'
import wixWindowFrontend from 'wix-window-frontend';


$w.onReady(async function () {
    console.log("version 12.9.1");

    if (wixMembersFrontend.authentication.loggedIn()) {

        if(wixWindowFrontend.formFactor === 'Mobile'){
            $w('#filterBox').collapse()
        }else{
            $w('#filterBox').expand()
        }

        const userEmail = (await wixMembersFrontend.currentMember.getMember()).loginEmail
        const userId = (await wixMembersFrontend.currentMember.getMember())._id
        // const userEmail = 'dhairya.extra+11@gmail.com'
        // const userId = '3f85652e-d637-40ba-b102-07453ec4d4bc'

        // Get the favorite products for the logged-in user
        const favouriteResults = await wixData.query('CustomerFavourite')
            .eq('customerId', userId)
            .find();

        const favouriteProducts = favouriteResults.items.map(item => item.productId);

        // Load live products and set the repeater data
        let productResults = await wixData.query('Product')
            .eq('productStatus', true)
            .include('category')
            .find();

        let products = productResults.items;
        console.log('Loaded products:', products);
        $w('#productsRepeater').data = products;
        $w('#count').text = `${products.length} products found`;
        

        // Populate dropdowns with distinct values from the 'Product' dataset
        // populateCategoryDropdown('#categoryFilter', wixData.query(constants.PRODUCT_DATABASE).eq('productStatus', true), "categoryTags")
        let healthGoals = await getCategories(constants.PRODUCT_DATABASE, wixData.query(constants.PRODUCT_DATABASE).eq('productStatus', true).include('healthGoals'))
        console.log(healthGoals);
        const uniqueHealthGoals = new Set();
        let healthGoalDropdownOptions = healthGoals.items
        .filter(item => {
            if (!uniqueHealthGoals.has(item?.healthGoals?._id)) {
            uniqueHealthGoals.add(item?.healthGoals?._id); // Add _id to the set
            return true; // Keep the item if not a duplicate
            }
            return false; // Skip the item if it's a duplicate
        })
        .map(item => {
            return { label: item?.healthGoals?.title, value: item?.healthGoals?._id };
        });

        healthGoalDropdownOptions.unshift({label: 'All', value: 'All'})
        $w('#healthGoalsFilter').options = healthGoalDropdownOptions

        let categories = await getCategories(constants.PRODUCT_DATABASE, wixData.query(constants.PRODUCT_DATABASE).eq('productStatus', true).include('category'))
        console.log(categories);
        const uniqueCategories = new Set();
        let categoryDropdownOptions = categories.items
        .filter(item => {
            if (!uniqueCategories.has(item.category._id)) {
            uniqueCategories.add(item.category._id); // Add _id to the set
            return true; // Keep the item if not a duplicate
            }
            return false; // Skip the item if it's a duplicate
        })
        .map(item => {
            return { label: item?.category?.title, value: item?.category?._id };
        });

        categoryDropdownOptions.unshift({label: 'All', value: 'All'})
        $w('#categoryFilter').options = categoryDropdownOptions

        $w('#productsRepeater').onItemReady(($item, itemData, index) => {
            $item('#productImage').src = itemData.productImage;
            $item('#productImage2').src = itemData.feedImage1;
            $item('#productName').text = itemData.productName;
            $item('#productCategory').text = itemData.category.title;

            $item('#productImage').onClick(() => {
                wixLocationFrontend.to(itemData['link-product-productName'])
            })

            // Check if the product is a favorite and change the button background
            if (favouriteProducts.includes(itemData._id)) {
                // $item('#favouriteProduct').style.backgroundColor = 'red';
                $item('#favouriteProduct').icon = constants.FAVOURITE_FILL_ICON
            }else{
                $item('#favouriteProduct').icon = constants.FAVOURITE_ICON
            }

            $item('#favouriteProduct').onClick(async () => {
                // Save favorite product to the 'CustomerFavourite' dataset
                const toInsert = {
                    productName: itemData.productName,
                    productId: itemData._id,
                    customer: userEmail,
                    customerId: userId,
                    categoryTags: itemData.categoryTags,
                    subCategoryTags: itemData.subCategoryTags
                };

                // Check if the product is already a favorite
                const favCheck = await wixData.query('CustomerFavourite')
                    .eq('productId', itemData._id)
                    .eq('customerId', userId)
                    .find();

                if (favCheck.items.length === 0) {
                    // If not, insert the favorite
                    await wixData.insert('CustomerFavourite', toInsert);
                    $item('#favouriteProduct').icon = constants.FAVOURITE_FILL_ICON
                } else {
                    // If already favorite, remove from favorites
                    const favId = favCheck.items[0]._id;
                    await wixData.remove('CustomerFavourite', favId);
                    $item('#favouriteProduct').icon = constants.FAVOURITE_ICON
                }
            });
        });

        // Filter products based on search text and dropdown values
        const filterProducts = async () => {
            const searchText = $w('#searchBar').value.trim().toLowerCase(); // Ensure searchText is trimmed and lowercase
            const locationFilter = $w('#locationFilter').value;
            const healthGoalFilter = $w('#healthGoalsFilter').value;
            const categoryFilter = $w('#categoryFilter').value;
            const subCategoryFilter = $w('#subCategoryFilter').value;

            let filteredProducts = products;

            console.log('Filtering products with:', {
                searchText,
                locationFilter,
                categoryFilter,
                subCategoryFilter
            });

            // Apply search filter
            if (searchText) {
                filteredProducts = filteredProducts.filter(product => {
                    const productName = product.productName?.toLowerCase() || "";
                    const features = product.features?.toLowerCase() || "";
                    const category = product.category?.toLowerCase() || "";
                    const healthGoal = product.healthGoals?.toLowerCase() || "";
                    const subCategory = product.subCategory?.toLowerCase() || "";
                    const location = Array.isArray(product.location) ? product.location.join(', ').toLowerCase() : "";
                    const affiliateLink = product.affiliateLink?.toLowerCase() || "";
                    const description = product.description?.toLowerCase() || "";

                    return productName.includes(searchText) ||
                        features.includes(searchText) ||
                        category.includes(searchText) ||
                        subCategory.includes(searchText) ||
                        location.includes(searchText) ||
                        affiliateLink.includes(searchText) ||
                        description.includes(searchText);
                });
            }

            // Apply location filter
            if (locationFilter && locationFilter !== 'All') {
                filteredProducts = filteredProducts.filter(product => {
                    return Array.isArray(product.location) && product.location.includes(locationFilter);
                });
            }

            // Apply category filter
            // if (categoryFilter && categoryFilter !== 'All') {
            //     filteredProducts = filteredProducts.filter(product => {
            //         return Array.isArray(product.categoryTags) && product.categoryTags.includes(categoryFilter);
            //     });
            // }

            if (healthGoalFilter && healthGoalFilter !== 'All') {
                filteredProducts = filteredProducts.filter(product => {
                    return product.healthGoals && product.healthGoals === healthGoalFilter;
                });
            }

            if (categoryFilter && categoryFilter !== 'All') {
                filteredProducts = filteredProducts.filter(product => {
                    return product.category && product.category._id === categoryFilter;
                });
            }

            

            // Apply sub-category filter
            // if (subCategoryFilter && subCategoryFilter !== 'All') {
            //     filteredProducts = filteredProducts.filter(product => {
            //         return Array.isArray(product.subCategoryTags) && product.subCategoryTags.includes(subCategoryFilter);
            //     });
            // }
            if (subCategoryFilter && subCategoryFilter !== 'All') {
                filteredProducts = filteredProducts.filter(product => {
                    return product.subCategory && product.subCategory === subCategoryFilter;
                });
            }

            console.log('Filtered products:', filteredProducts);

            // Update the repeater with filtered data
            $w('#productsRepeater').data = filteredProducts;

            // Display the count of filtered products
            $w('#count').text = `${filteredProducts.length} products found`;
        };

        // Attach event handlers to search bar and dropdowns
        $w('#searchBar').onInput(filterProducts);
        $w('#locationFilter').onChange(filterProducts);
        $w('#healthGoalsFilter').onChange(async () => {
            let categories = await getCategories(constants.PRODUCT_DATABASE, wixData.query(constants.PRODUCT_DATABASE).eq('productStatus', true).include('healthGoals').include('category').hasSome('healthGoals', $w('#healthGoalsFilter').value))
            const uniqueCategories = new Set();
            let categoryDropdownOptions = categories.items
            .filter(item => {
                if (!uniqueCategories.has(item.category._id)) {
                uniqueCategories.add(item.category._id); // Add _id to the set
                return true; // Keep the item if not a duplicate
                }
                return false; // Skip the item if it's a duplicate
            })
            .map(item => {
                return { label: item.category.title, value: item.category._id };
            });
            categoryDropdownOptions.unshift({label: 'All', value: 'All'})
            $w('#categoryFilter').options = categoryDropdownOptions

            filterProducts(); // Call filterProducts to refresh the display
        })

        $w('#categoryFilter').onChange(async () => {
            let subCategories = await getCategories(constants.PRODUCT_DATABASE, wixData.query(constants.PRODUCT_DATABASE).eq('productStatus', true).include('category').include('subCategory').hasSome('category', $w('#categoryFilter').value))
            const uniqueSubCategories = new Set();
            let subCategoryDropdownOptions = subCategories.items
            .filter(item => {
                if (!uniqueSubCategories.has(item.subCategory._id)) {
                uniqueSubCategories.add(item.subCategory._id); // Add _id to the set
                return true; // Keep the item if not a duplicate
                }
                return false; // Skip the item if it's a duplicate
            })
            .map(item => {
                return { label: item.subCategory.title, value: item.subCategory._id };
            });
            subCategoryDropdownOptions.unshift({label: 'All', value: 'All'})
            $w('#subCategoryFilter').options = subCategoryDropdownOptions

            filterProducts(); // Call filterProducts to refresh the display
        });

        $w('#subCategoryFilter').onChange(filterProducts);

        // Reset filters functionality
        $w('#resetFilter').onClick(() => {
            $w('#searchBar').value = '';
            $w('#locationFilter').value = 'All';
            $w('#categoryFilter').value = 'All';
            $w('#subCategoryFilter').value = 'All';
            filterProducts(); // Call filterProducts to refresh the display
        });
    } else {
        console.log("User not logged in");
    }
});