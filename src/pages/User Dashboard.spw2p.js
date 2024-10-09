// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixData from "wix-data";
import wixUsers from "wix-users";
import wixLocationFrontend from "wix-location-frontend";
import { authentication, currentMember } from "wix-members-frontend";
import { session } from "wix-storage";
import wixLocation from "wix-location";
// import { getAuthUrl } from "backend/OAuth";
import * as constants from "public/constants";
import {viewImageWhenUpload } from 'public/utils';
import {getCategories} from 'public/categories'

const STATE_BOX_ID = /** @type {const} */ ({
    HOME: "HOME",
    BENEFITS: "BENEFITS",
    FAVOURITES: "FAVOURITES",
    PROFILE: "PROFILE",
});

/**@type {keyof STATE_BOX_ID} */
let CURRENT_PAGE = "HOME";

const PAGE = /** @type {const} */ ({
    HOME: {
        $btn: $w("#btnHome"),
    },
    BENEFITS: {
        $btn: $w("#btnBenefits"),
    },
    FAVOURITES: {
        $btn: $w("#btnFavourites"),
    },
    PROFILE: {
        $btn: $w("#btnProfile"),
    },
});

const selectedButtonColor = "#E3E7EC";
const buttonColor = "#ffffff";
const hoverButtonColor = "#000000";
const hoverTextColor = "#ffffff";

$w.onReady(async function () {

    let userId = (await currentMember.getMember())._id

    console.log("Version 2.1");
    initSidebar();

    ///////////// PROFILE BEGIN ///////////

    $w("#updatePassword").onClick(() => {
        console.log("Prompting forgot password");
        authentication.promptForgotPassword();
    });

    $w("#uploadProfilePicture").onChange(uploadProfilePicture); // Handle profile picture upload

    function uploadProfilePicture() {
        console.log("Uploading profile picture...");
        $w("#uploadProfilePicture")
            .uploadFiles()
            .then((uploadedFiles) => {
                if (uploadedFiles.length > 0) {
                    const picture = uploadedFiles[0].fileUrl;
                    $w("#displayPicture").src = picture;
                    $w('#userDataset').setFieldValue('picture', picture)
                    console.log("Profile picture uploaded:", picture);
                }
            })
            .catch((uploadError) => {
                console.error("Error uploading profile picture:", uploadError);
                $w("#errorMessage").text =
                    "Error uploading profile picture. Please try again.";
                $w("#errorMessage").show();
            });
    }

    //   $w('#saveUserInfo').onClick(() => {
    // 	  $w('#userDataset').save()
    //   })

    $w('#userDataset').onAfterSave(() => {
        $w('#userDataset').setFieldValue('profileComplete', true);
        $w('#userDataset').save();
        // return true
    })

    setTimeout(() => $w("#successMessage").hide(), 1000);
    setTimeout(() => $w("#errorMessage").hide(), 1000);
    // Get Profile Information using getMember from the backend
    // Prepopulate the fields that already exis
    // Update Profile Information on save.
    // Initally Mark profile as incomplete.
    // Unless they fill up everything that is necessary redirect them to profile page to complete the profile everytime they login else dashboard home. (This would be added to masterpage onLogin)
    // Make sure they fill the necessary fields for profile completion.
    // Once done you can mark the profile as complete.

    /////////// PROFILE END ///////////////

    ////////// FAVOURITES BEGIN ////////////

    await $w('#userFavoriteDataset').onReadyAsync()

    if($w('#userFavoriteDataset').getTotalCount() === 0){
        $w('#noResultsFound').expand()
    }else{
        $w('#noResultsFound').collapse()
    }

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

        // filterProducts(products); // Call filterProducts to refresh the display
    });

    // $w("#resetButton").onClick(async () => {
    //     $w("#searchInput").value = "";
    //     $w("#categoryDropdown").value = "";
    //     $w("#subCategoryDropdown").value = "";
    //     $w("#noResultsFound").collapse();
    //     await $w("#userFavoriteDataset").refresh();
    // })

    // setupCategoryAndSubCategoryFiltering('categoryDropdown', 'subCategoryDropdown', 'userFavoritesRepeater', 'noResultsFound');
    // setupRepeaterSearch(constants.CUSTOMER_FAVOURITE_DATABASE, 'searchInput', 'userFavoritesRepeater', 'productName', 'noResultsFound');


    /// Load all the users favourite
    // Add code to unfavourite an item essentially delete it from the dataset. Make sure to from the view also

    ////////// FAVOURITES END ////////////
});

function initSidebar() {
    // Setup icon color
    renderPage(validPage(wixLocationFrontend.query.page) || "HOME");

    // dashboard button
    for (const [key, { $btn }] of Object.entries(PAGE)) {
        $btn.onClick(() => {
            //@ts-ignore
            renderPage(key);
        });
    }

    // renderSidebarUi();

    // $w("#btnSideBarM").onClick(async()=>{
    //     const action = await openLightbox("MOBILE_MENU", { currentPage: CURRENT_PAGE });
    //     if( action === "LOGOUT" ) handleLogOut();
    //     else  renderPage(action)
    // });

    // function handleLogOut() {
    //     wixLocationFrontend.to("/signout");
    // }
}

/**
 * @param {keyof typeof STATE_BOX_ID} $CURR_PAGE
 */
function renderPage($CURR_PAGE) {
    console.log("rendering....", $CURR_PAGE);
    CURRENT_PAGE = $CURR_PAGE;
    // const color = isActive => isActive ? BRAND_COLOR_PRIMARY : BRAND_COLOR_ASCENT;

    for (const [key, { buttonId, icon, $btn }] of Object.entries(PAGE)) {
        console.log(key, CURRENT_PAGE);
        if (!(key === CURRENT_PAGE)) {
            console.log("Running for : ", key);
            // @ts-ignore the key should be one of the page value
            // $btn.icon = getIcons(key, false);
            // $btn.style.color = BRAND_COLOR_ASCENT;
            $btn.style.backgroundColor = buttonColor;
            $btn.onMouseIn(() => {
                $btn.style.backgroundColor = hoverButtonColor;
                $btn.style.color = hoverTextColor;
            });
            $btn.onMouseOut(() => {
                $btn.style.backgroundColor = buttonColor;
                $btn.style.color = hoverButtonColor;
            });
        } else {
            $btn.style.backgroundColor = selectedButtonColor;
            $btn.style.color = hoverButtonColor;
            $btn.onMouseIn(() => {
                $btn.style.backgroundColor = selectedButtonColor;
                $btn.style.color = hoverButtonColor;
            });
            $btn.onMouseOut(() => {
                $btn.style.backgroundColor = selectedButtonColor;
                $btn.style.color = hoverButtonColor;
            });
        }
    }
    console.log(PAGE[CURRENT_PAGE]);

    // PAGE[CURRENT_PAGE].$btn.icon = getIcons(CURRENT_PAGE, true);
    // PAGE[CURRENT_PAGE].$btn.style.color = "#9b0025";

    // set all the icon as inactive
    // set current icon as active

    $w("#multiStateBox1").changeState(CURRENT_PAGE);
    wixLocationFrontend.queryParams.add({ page: CURRENT_PAGE });
}

/**
 * @return {keyof typeof STATE_BOX_ID} $CURR_PAGE
 */
function validPage($CURR_PAGE) {
    if (Object.keys(PAGE).includes($CURR_PAGE)) {
        return $CURR_PAGE;
    }
    return "HOME";
}

const filterProducts = async (products) => {
    const searchText = $w('#searchBar').value.trim().toLowerCase(); // Ensure searchText is trimmed and lowercase
    // const healthGoalFilter = $w('#healthGoalsFilter').value;
    const categoryFilter = $w('#categoryFilter').value;
    const subCategoryFilter = $w('#subCategoryFilter').value;

    let filteredProducts = products;

    let query = wixLocationFrontend.query

    console.log('Filtering products with:', {
        searchText,
        categoryFilter,
        subCategoryFilter,
        // healthGoalFilter
    });

    // Apply search filter
    if (searchText) {
        filteredProducts = filteredProducts.filter(product => {
            const productName = product.productName?.toLowerCase() || "";
            const features = product.features?.toLowerCase() || "";
            // const category = product.category?.toLowerCase() || "";
            // const healthGoal = product.healthGoals?.toLowerCase() || "";
            // const subCategory = product.subCategory?.toLowerCase() || "";
            const location = Array.isArray(product.location) ? product.location.join(', ').toLowerCase() : "";
            const affiliateLink = product.affiliateLink?.toLowerCase() || "";
            const description = product.description?.toLowerCase() || "";

            return productName.includes(searchText) ||
                features.includes(searchText) ||
                // category.includes(searchText) ||
                // subCategory.includes(searchText) ||
                location.includes(searchText) ||
                affiliateLink.includes(searchText) ||
                description.includes(searchText);
        });
    }

    // Apply category filter
    // if (categoryFilter && categoryFilter !== 'All') {
    //     filteredProducts = filteredProducts.filter(product => {
    //         return Array.isArray(product.categoryTags) && product.categoryTags.includes(categoryFilter);
    //     });
    // }
    

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
    $w('#userFavoritesRepeater').data = filteredProducts;

    // Display the count of filtered products
    // $w('#count').text = `${filteredProducts.length} products found`;
};