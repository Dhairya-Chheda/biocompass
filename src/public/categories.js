import wixData from 'wix-data';
import * as constatns from 'public/constants'

export async function populateCategoryDropdown(dropdownId, categoryColumn, initialQuery) {
    let categories
    if(initialQuery){
        categories = await initialQuery.distinct(categoryColumn)

        categories.items.unshift('All'); // Add 'All' option to the subcategory dropdown
        $w(dropdownId).options = categories.items.map(category => {
            return { label: category, value: category };
        });
    }else{
        categories = await wixData.query(constatns.CATEGORIES_DATABASE)
        .ascending('title') 
        .find()

    const dropdownOptions = [{
        label: "All",
        value: "All" 
    }];

    dropdownOptions.push(...categories.items.map(item => ({
        label: item['title'], 
        value: item._id 
    })));

    $w(dropdownId).options = dropdownOptions; 
    $w(dropdownId).value = "All"; 

    console.log("Category dropdown populated with options:", dropdownOptions)
    }
    
}

export function populateLocationDropdown(dropdownId) {

    return wixData.query(constatns.PRODUCT_DATABASE)
        .ascending('location') 
        .find()
        .then((results) => {
            const dropdownOptions = [{
                label: "All",
                value: "All" 
            }];

            dropdownOptions.push(...results.items.map(item => ({
                label: item['title'], 
                value: item._id 
            })));

            $w(dropdownId).options = dropdownOptions; 
            $w(dropdownId).value = "All"; 
            console.log("Category dropdown populated with options:", dropdownOptions);
        })
        .catch((err) => {
            console.error("Error populating category dropdown:", err);
        });
}

export async function populateSubCategoryDropdown(dropdownId, initialQuery, categoryColumn ,subCategoryColumn, selectedCategory) {
    let subCategories;
    if (selectedCategory === 'All') {
        // Get all distinct subcategories if 'All' is selected
        const subCategoryResults = await initialQuery
            .distinct(subCategoryColumn);
        subCategories = subCategoryResults.items;
    } else {
        // Get subcategories corresponding to the selected category
        const subCategoryResults = await initialQuery
            .hasSome(categoryColumn, selectedCategory)
            .distinct(subCategoryColumn);
        subCategories = subCategoryResults.items;
    }

    subCategories.unshift('All'); // Add 'All' option to the subcategory dropdown
    $w(dropdownId).options = subCategories.map(subCategory => {
        return { label: subCategory, value: subCategory };
    });
    $w(dropdownId).value = 'All'; // Set default value to 'All'
}

export async function getCategories(collection = 'Categories', query = null, distintColumn){
    let dataQuery = wixData.query(collection)
    if(query){
        dataQuery = query
    }

    if(distintColumn){
        return dataQuery
        .distinct(distintColumn)
        .then((res) => {
            return res
        })
        .catch((err) => {
            return err
        })
    }else{
        return dataQuery
        .find()
        .then((res) => {
            return res
        })
        .catch((err) => {
            return err
        })
    }
}

export async function getSubCategoryBasedOnCategoryReference(selectedCategory){
    return wixData.queryReferenced('Categories', selectedCategory, 'Sub-Categories_category')
    .then((res) => {
        return res

    })
    .catch((err) => {
        return err
    })
}