// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import {getCategories} from 'public/categories'
import * as constants from 'public/constants'
import wixData from 'wix-data';

let loadItems = 10
let filteredProducts
$w.onReady(async function () {
	$w('#businessRepeater').onItemReady(($item, itemData, index) => {
		$item('#description').text = itemData.description.slice(0,70) + '...'
		$item('#businessLogo').src = itemData.picture
		$item('#businessName').text = itemData.companyName
		$item('#businessLink').link = itemData['link-business-name']


	})

	let categories = await getCategories(constants.BUSINESS_DATABASE, wixData.query(constants.BUSINESS_DATABASE).include('category'))
	console.log("categories", categories);
	const uniqueCategories = new Set();
	let categoryDropdownOptions = categories.items
		.filter(item => {
			// Filter to only include items with unique categories
			let isUnique = false; // Flag to detect if the item has at least one unique category
			item.category.forEach((category) => {
				if (!uniqueCategories.has(category._id)) {
					uniqueCategories.add(category._id);
					isUnique = true; // Set flag true if at least one unique category is found
				}
			});
			return isUnique; // Return the flag value
		})
		.map(item => {
			// Now map those filtered items to dropdown options
			return item.category.map(cat => ({
				label: cat.title, // Ensure to get the title from the category object
				value: cat._id // Get the ID from the category object
			}));
		})
		.flat(); // Flatten the array since each item can map to multiple categories

	categoryDropdownOptions.unshift({ label: 'All', value: 'All' });

	console.log('categoryDropdownOptions', categoryDropdownOptions);
	$w('#categoryFilter').options = categoryDropdownOptions

	let businessQuery = await wixData.query('Business').include('category').find()
	let businesses = businessQuery.items

	console.log(businesses);
	filterProducts(businesses)

	$w('#searchBar').onInput(() => {filterProducts(businesses)})
	$w('#categoryFilter').onChange(() => {
		filterProducts(businesses)
	})

	$w('#resetFilter').onClick(() => {
		filterProducts(businesses, true)
	})

	$w('#loadMore').onClick(() => {
		loadItems+=10
		$w('#businessRepeater').data = filteredProducts.slice(0, loadItems)
		// if(loadItems)
	})

});


const filterProducts = async (products, reset = false) => {
	let searchText = ''
	let categoryFilter = undefined
	if(reset){
		$w('#categoryFilter').value = categoryFilter
		$w('#searchBar').value = ''
	}else{
		searchText = $w('#searchBar').value.trim().toLowerCase(); // Ensure searchText is trimmed and lowercase
		// const locationFilter = $w('#locationFilter').value;
		// const healthGoalFilter = $w('#healthGoalsFilter').value;
		categoryFilter = $w('#categoryFilter').value;
		// const subCategoryFilter = $w('#subCategoryFilter').value;
	}

    filteredProducts = products;

    console.log('Filtering products with:', {
        searchText,
        // locationFilter,
        categoryFilter,
        // subCategoryFilter,
        // healthGoalFilter
    });

    // Apply search filter
    if (searchText) {
        filteredProducts = filteredProducts.filter(product => {
            const businessName = product.companyName?.toLowerCase() || "";
            // const features = product.features?.toLowerCase() || "";
            // const category = product.category?.toLowerCase() || "";
            // const healthGoal = product.healthGoals?.toLowerCase() || "";
            // const subCategory = product.subCategory?.toLowerCase() || "";
            // const location = Array.isArray(product.location) ? product.location.join(', ').toLowerCase() : "";
            // const affiliateLink = product.affiliateLink?.toLowerCase() || "";
            const description = product.description?.toLowerCase() || "";

            return businessName.includes(searchText) ||
                // features.includes(searchText) ||
                // category.includes(searchText) ||
                // subCategory.includes(searchText) ||
                // location.includes(searchText) ||
                // affiliateLink.includes(searchText) ||
                description.includes(searchText);
        });
    }

    // Apply location filter
    // if (locationFilter && locationFilter !== 'All') {
    //     filteredProducts = filteredProducts.filter(product => {
    //         return Array.isArray(product.location) && product.location.includes(locationFilter);
    //     });
    // }

    // Apply category filter
    // if (categoryFilter && categoryFilter !== 'All') {
    //     filteredProducts = filteredProducts.filter(product => {
    //         return Array.isArray(product.categoryTags) && product.categoryTags.includes(categoryFilter);
    //     });
    // }

    // if (healthGoalFilter && healthGoalFilter !== 'All') {
    //     filteredProducts = filteredProducts.filter(product => {
    //         return product.healthGoals && product.healthGoals === healthGoalFilter;
    //     });
    // }
    // if(query.type === "healthGoals" && healthGoalFilter !== 'All'){
    //     $w('#healthGoalsFilter').value = query.q
    //     console.log('query', query.q);
    //     filteredProducts = filteredProducts.filter(product => {
    //         return product.healthGoals && product.healthGoals === query.q;
    //     });
    //     wixLocationFrontend.queryParams.remove(['type', 'q'])
    // }
    

    if (categoryFilter && categoryFilter !== 'All') {
        filteredProducts = filteredProducts.filter(item => {
			console.log("item", item);
            return item?.category?.some(cat => cat._id === categoryFilter);
        });
    }

    

    // Apply sub-category filter
    // if (subCategoryFilter && subCategoryFilter !== 'All') {
    //     filteredProducts = filteredProducts.filter(product => {
    //         return Array.isArray(product.subCategoryTags) && product.subCategoryTags.includes(subCategoryFilter);
    //     });
    // }
    // if (subCategoryFilter && subCategoryFilter !== 'All') {
    //     filteredProducts = filteredProducts.filter(product => {
    //         return product.subCategory && product.subCategory === subCategoryFilter;
    //     });
    // }

    console.log('Filtered products:', filteredProducts);

    // Update the repeater with filtered data
    $w('#businessRepeater').data = filteredProducts.slice(0, loadItems)

    // Display the count of filtered products
    // $w('#count').text = `${filteredProducts.length} products found`;
};