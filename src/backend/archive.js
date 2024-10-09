// User dashboard Page - Profile Update
/*
wixData
    .query(constants.USER_DATABASE)
    .eq("_owner", userId)
    .find()
    .then((results) => {
      if (results.items.length > 0) {
        let member = results.items[0];
        memberId = member._id;
        $w("#firstName").value = member. || "";
        $w("#userEmail").value = member.email || "";
        $w("#displayPicture").src = member.picture || "";
        $w("#userLocation").value = member.location || "";
        $w("#userPhoneNumber").value = member.phoneNumber || "";
        console.log("Member profile fetched:", member);
        if (member.profileComplete) {
          session.setItem("profileComplete", "true");
        } else {
          session.setItem("profileComplete", "false");
        }
      } else {
        console.log("No member profile found for user:", userId);
      }
    })
    .catch((error) => {
      console.error("Error fetching member profile:", error);
      $w("#errorMessage").text =
        "Error fetching member profile. Please try again.";
      $w("#errorMessage").show();
    });

  $w("#saveUserInfo").onClick(() => {
    console.log("Saving user information...");
    let name = $w("#userName").value;
    let email = $w("#userEmail").value;
    let picture = $w("#displayPicture").src;
    let location = $w("#userLocation").value;
    let phoneNumber = $w("#userPhoneNumber").value;

    let userData = {
      name: name,
      email: email,
      picture: picture,
      location: location,
      phoneNumber: phoneNumber,
      profileComplete:
        name && email && picture && location && phoneNumber ? true : false,
    };

    if (memberId) {
      userData._id = memberId;
    } else {
      userData._owner = userId;
    }

    wixData
      .save(constants.USER_DATABASE, userData)
      .then(() => {
        console.log("Profile saved successfully:", userData);
        $w("#successMessage").text = "Profile saved successfully!";
        $w("#successMessage").show();
        setTimeout(() => {
          $w("#successMessage").hide();
        }, 3000);

        session.setItem("profileComplete", "true");
        // wixLocation.to(constants.USER_DASHBOARD_URL);
      })
      .catch((error) => {
        console.error("Error saving profile:", error);
        $w("#errorMessage").text = "Error saving profile. Please try again.";
        $w("#errorMessage").show();
        setTimeout(() => {
          $w("#errorMessage").hide();
        }, 3000);
      });
  });

*/




/*
import { getMemberProfile, updateMemberDetails } from 'backend/member-profile';
$w.onReady(async function () {
    try {
        // Fetch member profile data
        const profile = await getMemberProfile();
        // Populate the fields with existing data
        $w("#firstNameInput").value = profile.firstName || '';
        $w("#lastNameInput").value = profile.lastName || '';
        $w("#contactNumberInput").value = profile.phone || '';
        $w("#instagramInput").value = profile.customFields ? profile.customFields['custom.custom_instagram_link']?.value || '' : '';
        $w("#youtubeInput").value = profile.customFields ? profile.customFields['custom.custom_youtube_channel']?.value || '' : '';
        //$w("#applicationReasonInput").value = profile.customFields ? profile.customFields['custom.scholapplicationreason']?.value || '' : '';
    } catch (error) {
        console.error('Error loading member profile:', error);
        $w("#successMessage").text = "Error loading profile";
    }

    $w("#saveProfile").onClick(async () => {
        // Collect values from the form
        const customData = {
            custom_instagram_link: $w("#instagramInput").value,
            custom_youtube_channel: $w("#youtubeInput").value,
            //scholapplicationreason: $w("#applicationReasonInput").value
            // Add more fields as needed
        };

        const memberData = {
            firstName: $w("#firstNameInput").value,
            lastName: $w("#lastNameInput").value,
            contactNumber: $w("#contactNumberInput").value,
            customData: customData
        };

        try {
            // Call the backend function
            const result = await updateMemberDetails(memberData);

            if (result.success === 'success') {
                $w("#successMessage").text = "Profile updated successfully";
            } else {
                $w("#successMessage").text = `Error updating profile: ${result.message}`;
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            $w("#successMessage").text = "Error updating profile";
        }
    });
});*/

import wixMembers from 'wix-members';
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixWindow from 'wix-window';
import { myUpdateMemberFunction } from 'backend/member-profile.web.js'; // Adjust the path as necessary



$w.onReady(function () {
    initializeMemberProfile();
    initializeProductManagement();
    initializeCenterManagement();

    $w("#button122").onClick(() => {
        $w("#box").changeState('addCenter')
    })
});

function initializeMemberProfile() {
    wixData.query('Members/FullData')
        .find()
        .then((results) => {
            console.log(results);
        });

    $w('#saveProfile').onClick(async () => {
        const customInstagramLink = $w('#instagramInput').value;
        const customYoutubeChannel = $w('#youtubeInput').value;
        const firstName = $w('#firstNameInput').value;
        const lastName = $w('#lastNameInput').value;
        const contactNumber = $w('#contactNumberInput').value;
        const profilePhotoUrl = $w('#displayProfilePicture').src; // Get the URL of the uploaded profile picture

        const memberId = await getMemberId();
        console.log('memberId:', memberId);

        if (memberId) {
            try {
                const updatedMember = await myUpdateMemberFunction(
                    memberId,
                    customInstagramLink,
                    customYoutubeChannel,
                    firstName,
                    lastName,
                    contactNumber,
                    profilePhotoUrl // Pass the profile picture URL
                );
                console.log('Member updated successfully', updatedMember);
                // Show success message to user
            } catch (error) {
                console.error('Error updating member:', error);
                // Show error message to user
            }
        } else {
            console.error('Member ID not found');
            // Show error message to user
        }
    });

    $w('#uploadProfilePicture').onChange(uploadProfilePicture); // Handle profile picture upload

    function uploadProfilePicture() {
        $w('#uploadProfilePicture').uploadFiles()
            .then((uploadedFiles) => {
                if (uploadedFiles.length > 0) {
                    const profilePhotoUrl = uploadedFiles[0].fileUrl; // Get the URL of the uploaded file
                    $w('#displayProfilePicture').src = profilePhotoUrl; // Display the uploaded profile picture
                }
            })
            .catch((uploadError) => {
                console.error('Error uploading profile picture:', uploadError);
            });
    }
}

async function getMemberId() {
    const member = await wixMembers.currentMember.getMember();
    return member?._id;
}

function initializeProductManagement() {
    const user = wixUsers.currentUser.id;
    console.log('Current User ID:', user);

    let catalogImages = [];
    let isEditing = false;
    let editingProductId = null;

    function loadProducts(searchText = '') {
        let query = wixData.query('Product').eq('_owner', user);

        if (searchText) {
            query = query.contains('productName', searchText);
        }

        query.find()
            .then((products) => {
                $w('#productRepeater').data = [];
                $w('#productRepeater').data = products.items;
                console.log('Products loaded:', products.items);
            })
            .catch((error) => {
                console.error('Error loading products:', error);
            });
    }

    loadProducts();

    $w('#searchBar').onKeyPress(() => {
        const searchText = $w('#searchBar').value;
        console.log('Search text:', searchText);
        loadProducts(searchText);
    });

    $w('#productRepeater').onItemReady(($item, itemData) => {
        $item('#productImage').src = itemData.productImage;
        $item('#productName').text = itemData.productName;
        $item('#productFeatures').text = itemData.productFeatures;
        $item('#productStatus').text = itemData.productStatus;

        $item('#editProduct').onClick(() => {
            console.log('Editing product:', itemData);
            populateProductForm(itemData);
            isEditing = true;
            editingProductId = itemData._id;
            changeState('addProduct');
            $w('#switchTab').value = null;

        });

        $item('#deleteProduct').onClick(() => {
            wixWindow.openLightbox('Confirm Delete', { productId: itemData._id })
                .then((result) => {
                    if (result === 'confirm') {
                        deleteProduct(itemData._id);
                    } else {
                        console.log('Deletion canceled');
                    }
                })
                .catch((error) => {
                    console.error('Error opening lightbox:', error);
                });
        });
    });

    $w('#addProductButton').onClick(() => changeState('addProduct'));
    $w('#switchTab').value = null;
    $w('#switchTab').onChange(handleTabChange);

    $w('#uploadProductCatalog').onChange(uploadCatalogFiles);
    $w('#uploadProductImage').onChange(uploadProductImage);

    $w('#save').onClick(saveProduct);

    $w('#back').onClick(() => {
        $w('#box').changeState('manageProducts')
    })

    function handleTabChange(event) {
        const selectedTags = $w('#switchTab').value;
        const selectedTag = selectedTags[selectedTags.length - 1];

        if (selectedTags.length > 1) {
            $w('#switchTab').value = [selectedTag];
        }

        changeState(selectedTag);
    }

    function changeState(state) {
        $w('#box').changeState(state)
            .then(() => console.log(`State changed to: ${state}`))
            .catch((error) => console.error(`Failed to change state: ${error.message}`));
    }

    function populateProductForm(itemData) {
        $w('#productNameInput').value = itemData.productName;
        $w('#productDescriptionInput').value = itemData.description;
        $w('#productFeaturesInput').value = itemData.features;
        $w('#productCategoryInput').value = itemData.category;
        $w('#productAffiliateLinkInput').value = itemData.affiliateLink;
        $w('#displayProductImage').src = itemData.productImage;
        catalogImages = itemData.productCatalog.map((image, index) => ({
            _id: `item-${Date.now()}-${index}`,
            type: 'image',
            src: image.src,
            title: image.title,
        })) || [];
        $w('#catalogRepeater').data = catalogImages;
    }
    $w('#catalogRepeater').onItemReady(($product, productData) => {
        $w('#catalogRepeater').show();
        $product('#catalogImage').src = productData.src;

        // Handle delete image button click
        $product('#deleteImage').onClick(() => {
            // Remove the image from the catalogImages array
            catalogImages = catalogImages.filter((image) => image._id !== productData._id);
            console.log('Updated catalog images after deletion:', catalogImages);

            // Update the catalog repeater data
            $w('#catalogRepeater').data = catalogImages;
            console.log('Updated catalogRepeater data after deletion:', $w('#catalogRepeater').data);
        });
    });

    function deleteProduct(productId) {
        wixData.remove('Product', productId)
            .then(() => {
                console.log('Product deleted successfully');
                loadProducts();
            })
            .catch((error) => {
                console.error('Error deleting product:', error);
            });
    }

    function uploadCatalogFiles() {
        $w('#save').disable();
        $w('#uploadProductCatalog').uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach((file, index) => {
                    catalogImages.push({
                        _id: `item-${Date.now()}-${index}`,
                        type: 'image',
                        src: file.fileUrl,
                        title: file.fileName,
                    });
                });
                $w('#catalogRepeater').data = catalogImages;
                $w('#catalogRepeater').show();
                $w('#save').enable();
            })
            .catch((uploadError) => {
                console.error('Error uploading catalog files:', uploadError);
                $w('#save').enable();
            });
    }

    function uploadProductImage() {
        $w('#save').disable();
        $w('#uploadProductImage').uploadFiles()
            .then((uploadedFiles) => {
                if (uploadedFiles.length > 0) {
                    const productImageUrl = uploadedFiles[0].fileUrl;
                    $w('#displayProductImage').src = productImageUrl;
                    $w('#save').enable();
                }
            })
            .catch((uploadError) => {
                console.error('Error uploading product image:', uploadError);
                $w('#save').enable();
            });
    }

    function saveProduct() {
        $w('#loader').show();

        const productName = $w('#productNameInput').value;
        const productDescription = $w('#productDescriptionInput').value;
        const productCategory = $w('#productCategoryInput').value;
        const productFeatures = $w('#productFeaturesInput').value;
        const productAffiliateLink = $w('#productAffiliateLinkInput').value;
        const productImageUrl = $w('#displayProductImage').src;

        if (!isValidProduct(productName, productDescription, productImageUrl)) {
            $w('#loader').hide();
            return;
        }

        const productData = {
            productImage: productImageUrl,
            productCatalog: catalogImages.map(image => ({
                type: 'image',
                src: image.src,
                title: image.title,
            })),
            productName,
            description: productDescription,
            features: productFeatures,
            category: productCategory,
            affiliateLink: productAffiliateLink,
            productStatus: 'Not Live',
            _owner: user,
        };

        const saveOperation = isEditing ?
            wixData.update('Product', { _id: editingProductId, ...productData }) :
            wixData.insert('Product', productData);

        saveOperation
            .then(() => {
                resetProductForm();
                $w('#loader').hide();
                $w('#successMessage').show();
                setTimeout(() => $w('#successMessage').hide(), 2000);
                changeState('manageProducts');
                loadProducts();
            })
            .catch((error) => {
                console.error('Error saving product:', error);
                $w('#loader').hide();
            });
    }

    function isValidProduct(productName, productDescription, productImageUrl) {
        if (isEditing) {
            if (!productName || !productDescription) {
                console.error('Validation failed: Product name and description are required for editing.');
                return false;
            }
        } else {
            if (!productName || !productDescription || !productImageUrl) {
                console.error('Validation failed: Product image, name, and description are required for new products.');
                return false;
            }
        }
        return true;
    }

    function resetProductForm() {
        $w('#productNameInput').value = '';
        $w('#productDescriptionInput').value = '';
        $w('#productFeaturesInput').value = '';
        $w('#productCategoryInput').value = '';
        $w('#productAffiliateLinkInput').value = '';
        $w('#displayProductImage').src = '';
        catalogImages = [];
        $w('#catalogRepeater').data = [];
        isEditing = false;
        editingProductId = null;
    }
}

function initializeCenterManagement() {
    const user = wixUsers.currentUser.id;
    console.log('Current User ID:', user);

    let catalogImages = [];
    let isEditing = false;
    let editingCenterId = null;

    function loadCenters(searchText = '') {
        let query = wixData.query('Centers').eq('_owner', user);

        if (searchText) {
            query = query.contains('centerName', searchText);
        }

        query.find()
            .then((centers) => {
                $w('#manageCentersRepeater').data = [];
                $w('#manageCentersRepeater').data = centers.items;
                console.log('Centers loaded:', centers.items);
            })
            .catch((error) => {
                console.error('Error loading centers:', error);
            });
    }

    loadCenters();

    $w('#searchCenterInput').onKeyPress(() => {
        const searchText = $w('#searchCenterInput').value;
        console.log('Search text:', searchText);
        loadCenters(searchText);
    });

    $w('#manageCentersRepeater').onItemReady(($item, itemData) => {
        $item('#centerDisplayImage').src = itemData.centerImage;
        $item('#centerName').text = itemData.centerName;
        $item('#centerDetails').text = itemData.centerDetails;

        $item('#editCenterButton').onClick(() => {
            console.log('Editing center:', itemData);
            populateCenterForm(itemData);
            isEditing = true;
            editingCenterId = itemData._id;
            changeState('addCenter');
            $w('#switchTab').value = null;
        });
    });

    $w('#addNewCenterButton').onClick(() => changeState('addCenter'));
    $w('#switchTab').value = null;
    $w('#switchTab').onChange(handleTabChange);

    $w('#uploadCenterCatalog').onChange(uploadCatalogFiles);
    $w('#uploadCenterDisplayButton').onChange(uploadCenterImage);

    $w('#saveCenterButton').onClick(saveCenter);

    $w('#backToManageCenters').onClick(() => {
        $w('#box').changeState('manageCenters')
    });

    function handleTabChange(event) {
        const selectedTags = $w('#switchTab').value;
        const selectedTag = selectedTags[selectedTags.length - 1];

        if (selectedTags.length > 1) {
            $w('#switchTab').value = [selectedTag];
        }

        changeState(selectedTag);
    }

    function changeState(state) {
        $w('#box').changeState(state)
            .then(() => console.log(`State changed to: ${state}`))
            .catch((error) => console.error(`Failed to change state: ${error.message}`));
    }

    function populateCenterForm(itemData) {
        $w('#centerNameInput').value = itemData.centerName;
        $w('#centerDetailsInput').value = itemData.centerDetails;
        $w('#centerDisplayImageSrc').src = itemData.centerImage;
        catalogImages = itemData.catalog.map((image, index) => ({
            _id: `item-${Date.now()}-${index}`,
            type: 'image',
            src: image.src,
            title: image.title,
        })) || [];
        $w('#centerCatalogRepeater').data = catalogImages;
    }

    $w('#centerCatalogRepeater').onItemReady(($center, centerData) => {
        $w('#centerCatalogRepeater').show();
        $center('#centerCatalogImage').src = centerData.src;

        // Handle delete image button click
        $center('#centerCatalogImageDeleteButton').onClick(() => {
            // Remove the image from the catalogImages array
            catalogImages = catalogImages.filter((image) => image._id !== centerData._id);
            console.log('Updated catalog images after deletion:', catalogImages);

            // Update the catalog repeater data
            $w('#centerCatalogRepeater').data = catalogImages;
            console.log('Updated centerCatalogRepeater data after deletion:', $w('#centerCatalogRepeater').data);
        });
    });

    function uploadCatalogFiles() {
        $w('#saveCenterButton').disable();
        $w('#uploadCenterCatalog').uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach((file, index) => {
                    catalogImages.push({
                        _id: `item-${Date.now()}-${index}`,
                        type: 'image',
                        src: file.fileUrl,
                        title: file.fileName,
                    });
                });
                $w('#centerCatalogRepeater').data = catalogImages;
                $w('#centerCatalogRepeater').show();
                $w('#saveCenterButton').enable();
            })
            .catch((uploadError) => {
                console.error('Error uploading catalog files:', uploadError);
                $w('#saveCenterButton').enable();
            });
    }

    function uploadCenterImage() {
        $w('#saveCenterButton').disable();
        $w('#uploadCenterDisplayButton').uploadFiles()
            .then((uploadedFiles) => {
                if (uploadedFiles.length > 0) {
                    const centerImageUrl = uploadedFiles[0].fileUrl;
                    $w('#centerDisplayImageSrc').src = centerImageUrl;
                    $w('#saveCenterButton').enable();
                }
            })
            .catch((uploadError) => {
                console.error('Error uploading center image:', uploadError);
                $w('#saveCenterButton').enable();
            });
    }

    function saveCenter() {
        $w('#loaderCenters').show();

        const centerName = $w('#centerNameInput').value;
        const centerDetails = $w('#centerDetailsInput').value;
        const centerImageUrl = $w('#centerDisplayImageSrc').src;

        if (!isValidCenter(centerName, centerDetails, centerImageUrl)) {
            $w('#loaderCenters').hide();
            return;
        }

        const centerData = {
            centerImage: centerImageUrl,
            catalog: catalogImages.map(image => ({
                type: 'image',
                src: image.src,
                title: image.title,
            })),
            centerName,
            centerDetails,
            _owner: user,
        };

        const saveOperation = isEditing ?
            wixData.update('Centers', { _id: editingCenterId, ...centerData }) :
            wixData.insert('Centers', centerData);

        saveOperation
            .then(() => {
                resetCenterForm();
                $w('#loaderCenters').hide();
                $w('#successMessage').show();
                setTimeout(() => $w('#successMessage').hide(), 2000);
                changeState('manageCenters');
                loadCenters();
            })
            .catch((error) => {
                console.error('Error saving center:', error);
                $w('#loaderCenters').hide();
            });
    }

    function isValidCenter(centerName, centerDetails, centerImageUrl) {
        if (isEditing) {
            if (!centerName || !centerDetails) {
                console.error('Validation failed: Center name and details are required for editing.');
                return false;
            }
        } else {
            if (!centerName || !centerDetails || !centerImageUrl) {
                console.error('Validation failed: Center image, name, and details are required for new centers.');
                return false;
            }
        }
        return true;
    }

    function resetCenterForm() {
        $w('#centerNameInput').value = '';
        $w('#centerDetailsInput').value = '';
        $w('#centerDisplayImageSrc').src = '';
        catalogImages = [];
        $w('#centerCatalogRepeater').data = [];
        isEditing = false;
        editingCenterId = null;
    }
}


/*import { myUpdateMemberFunction } from 'backend/member-profile.web.js'; // Adjust the path as necessary
import wixMembers from 'wix-members';
import wixData from 'wix-data';

$w.onReady(function() {

    wixData.query('Members/FullData')
    .find()
    .then((results) => {
        console.log(results);
    })
  $w('#saveProfile').onClick(async () => { // Assuming there's a button to trigger the update
    const customInstagramLink = $w('#instagramInput').value;
    const customYoutubeChannel = $w('#youtubeInput').value;
    
    const memberId = await getMemberId(); // Implement this function to get the current member's ID
    console.log('memberId : ', memberId);

    if (memberId) {
      try {
        const updatedMember = await myUpdateMemberFunction(memberId, customInstagramLink, customYoutubeChannel);
        console.log('Member updated successfully', updatedMember);
        // Show success message to user
      } catch (error) {
        console.error('Error updating member:', error);
        // Show error message to user
      }
    } else {
      console.error('Member ID not found');
      // Show error message to user
    }
  });
});

async function getMemberId() {
  // Example function to get the current member's ID
  const member = await wixMembers.currentMember.getMember();
  return member?._id;
}

import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixWindow from 'wix-window'; // Import wixWindow to interact with lightboxes

$w.onReady(function () {

    $w('#addProductButton').onClick(() => {
        $w('#box').changeState('addProduct')
            .then(() => {
                console.log('State changed to: addProduct');
            })
            .catch((error) => {
                console.error(`Failed to change state: ${error.message}`);
            });
    })
    console.log('Page Ready');

    const user = wixUsers.currentUser.id;
    console.log(user);

    // Initialize an array to store the uploaded catalog images
    let catalogImages = [];
    let isEditing = false;
    let editingProductId = null;

    // Function to fetch and display products
    function loadProducts(searchText = '') {
        let query = wixData.query('Product'); // No user filter

        if (searchText) {
            // Filter products based on search text
            query = query.contains('productName', searchText); // Adjust field name as needed
        }

        query.find()
            .then((products) => {
                $w('#productRepeater').data = [];
                $w('#productRepeater').data = products.items;
                console.log('Products loaded:', products.items);
            })
            .catch((error) => {
                console.error('Error loading products:', error);
            });
    }

    // Initial load of products
    loadProducts();

    // Event handler for search bar key press
    $w('#searchBar').onKeyPress((event) => {
        const searchText = $w('#searchBar').value;
        console.log('Search text:', searchText);

        // Load products with search text
        loadProducts(searchText);
    });

    // Event handler for repeater item ready
    $w('#productRepeater').onItemReady(($item, itemData) => {
        $item('#productImage').src = itemData.productImage;
        $item('#productName').text = itemData.productName;
        $item('#productFeatures').text = itemData.productFeatures;
        $item('#productStatus').text = itemData.productStatus;

        // Handle edit button click
        $item('#editProduct').onClick(() => {
            console.log('Editing product:', itemData);

            // Populate input fields with existing product data
            $w('#productNameInput').value = itemData.productName;
            $w('#productDescriptionInput').value = itemData.description;
            $w('#productFeaturesInput').value = itemData.features;
            $w('#productAffiliateLinkInput').value = itemData.affiliateLink;
            $w('#displayProductImage').src = itemData.productImage;
            catalogImages = itemData.productCatalog.map((image, index) => ({
                _id: `item-${Date.now()}-${index}`, // Generate a unique ID
                type: 'image',
                src: image.src,
                title: image.title,
            })) || [];

            // Log catalogImages to verify its content
            console.log('Catalog images to be loaded into repeater:', catalogImages);

            // Update catalogRepeater with the current product images
            $w('#catalogRepeater').data = catalogImages;

            // Populate repeater items
            $w('#catalogRepeater').onItemReady(($product, productData) => {
                $product('#catalogImage').src = productData.src;

                // Handle delete image button click
                $product('#deleteImage').onClick(() => {
                    // Remove the image from the catalogImages array
                    catalogImages = catalogImages.filter((image) => image._id !== productData._id);
                    console.log('Updated catalog images after deletion:', catalogImages);

                    // Update the catalog repeater data
                    $w('#catalogRepeater').data = catalogImages;
                    console.log('Updated catalogRepeater data after deletion:', $w('#catalogRepeater').data);
                });
            });

            // Set editing flag and store the product ID
            isEditing = true;
            editingProductId = itemData._id;

            // Change state to 'addProduct' for editing
            $w('#box').changeState('addProduct')
                .then(() => {
                    console.log('State changed to: addProduct');
                })
                .catch((error) => {
                    console.error(`Failed to change state: ${error.message}`);
                });
        });

        // Handle delete button click
        $item('#deleteProduct').onClick(() => {
            // Open the confirmation lightbox
            wixWindow.openLightbox('Confirm Delete', { productId: itemData._id })
                .then((result) => {
                    if (result === 'confirm') {
                        // If confirmed, delete the product
                        wixData.remove('Product', itemData._id)
                            .then(() => {
                                console.log('Product deleted successfully');
                                loadProducts(); // Reload products to update the repeater
                            })
                            .catch((error) => {
                                console.error('Error deleting product:', error);
                            });
                    } else {
                        console.log('Deletion canceled');
                    }
                })
                .catch((error) => {
                    console.error('Error opening lightbox:', error);
                });
        });
    });

    // Event handler for selection tag change
    $w('#switchTab').onChange((event) => {
        // Get the selected tag
        const selectedTags = $w('#switchTab').value; // Gets the array of selected tags
        const selectedTag = selectedTags[selectedTags.length - 1]; // Get the most recently selected tag
        console.log('selectedTag -', selectedTag);

        // Ensure only one tag is selected at a time
        if (selectedTags.length > 1) {
            // Unselect all tags
            $w('#switchTab').value = [selectedTag];
            console.log('Tag selection updated to:', selectedTag);
        }

        // Change the state of the MultiState Box if the state exists
        $w('#box').changeState(selectedTag)
            .then(() => {
                console.log(`State changed to: ${selectedTag}`);
            })
            .catch((error) => {
                console.error(`Failed to change state: ${error.message}`);
            });
    });

    // Event handler for catalog file upload
    $w('#uploadProductCatalog').onChange(() => {
        $w('#save').disable();
        $w('#uploadProductCatalog').uploadFiles()
            .then((uploadedFiles) => {
                // Add uploaded files to the catalogImages array with unique IDs
                uploadedFiles.forEach((file, index) => {
                    catalogImages.push({
                        _id: `item-${Date.now()}-${index}`, // Generate a unique ID
                        type: 'image',
                        src: file.fileUrl,
                        title: file.fileName,
                    });
                });
                console.log('Uploaded catalog images:', catalogImages);

                // Update the catalog repeater data
                $w('#catalogRepeater').data = catalogImages;
                console.log('Updated catalogRepeater data:', $w('#catalogRepeater').data);
                $w('#save').enable();
            })
            .catch((uploadError) => {
                console.error('Error uploading catalog files:', uploadError);
                $w('#save').enable();
            });
    });

    // Event handler for product image upload
    $w('#uploadProductImage').onChange(() => {
        $w('#save').disable();
        $w('#uploadProductImage').uploadFiles()
            .then((uploadedFiles) => {
                if (uploadedFiles.length > 0) {
                    // Get the URL of the uploaded image
                    const productImageUrl = uploadedFiles[0].fileUrl;

                    // Display the uploaded image
                    $w('#displayProductImage').src = productImageUrl;

                    console.log('Product image uploaded and displayed:', productImageUrl);
                    $w('#save').enable();
                }
            })
            .catch((uploadError) => {
                console.error('Error uploading product image:', uploadError);
                $w('#save').enable();
            });
    });

    // Event handler for catalog repeater item ready
    $w('#catalogRepeater').onItemReady(($item, itemData) => {
        console.log('Repeater item ready:', itemData);
        $item('#catalogImage').src = itemData.src;
        //$item('#catalogTitle').text = itemData.title; // Uncomment if title is used

        $item('#deleteImage').onClick(() => {
            // Remove the image from the catalogImages array
            catalogImages = catalogImages.filter((image) => image._id !== itemData._id);
            console.log('Updated catalog images after deletion:', catalogImages);

            // Update the catalog repeater data
            $w('#catalogRepeater').data = catalogImages;
            console.log('Updated catalogRepeater data after deletion:', $w('#catalogRepeater').data);
        });
    });

    // Event handler for save button click
    $w('#save').onClick(() => {
        // Show loader
        $w('#loader').show();
        console.log('Loader displayed');

        // Collect input values
        const productName = $w('#productNameInput').value;
        const productDescription = $w('#productDescriptionInput').value;
        const productFeatures = $w('#productFeaturesInput').value;
        const productAffiliateLink = $w('#productAffiliateLinkInput').value;
        const productImageUrl = $w('#displayProductImage').src;

        // Validate input based on whether editing or inserting
        if (isEditing) {
            if (!productName || !productDescription) {
                console.error('Validation failed: Product name and description are required for editing.');
                $w('#loader').hide(); // Hide loader on validation failure
                return;
            }
        } else {
            if (!productName || !productDescription || !productImageUrl) {
                console.error('Validation failed: Product image, name, and description are required for new products.');
                $w('#loader').hide(); // Hide loader on validation failure
                return;
            }
        }

        // Function to save the product
        const saveProduct = (productImageUrl) => {
            const productData = {
                productImage: productImageUrl,
                productCatalog: catalogImages.map(image => ({
                    type: 'image',
                    src: image.src,
                    title: image.title,
                })),
                productName,
                description: productDescription,
                features: productFeatures,
                affiliateLink: productAffiliateLink,
                productStatus: 'Not Live',
                _owner: user, // Add owner information
            };

            if (isEditing) {
                // Update existing product
                return wixData.update('Product', { _id: editingProductId, ...productData });
            } else {
                // Create new product
                return wixData.insert('Product', productData);
            }
        };

        saveProduct(productImageUrl)
            .then(() => {
                console.log('Product saved successfully');

                // Reset form and flags
                $w('#productNameInput').value = '';
                $w('#productDescriptionInput').value = '';
                $w('#productFeaturesInput').value = '';
                $w('#productAffiliateLinkInput').value = '';
                $w('#displayProductImage').src = ''; // Clear the displayed image
                catalogImages = [];
                $w('#catalogRepeater').data = [];
                isEditing = false;
                editingProductId = null;

                // Hide loader and show success message
                $w('#loader').hide();
                console.log('Loader hidden');

                $w('#successMessage').show();
                console.log('Success message displayed');

                // Hide success message after 3 seconds
                setTimeout(() => {
                    $w('#successMessage').hide();
                    console.log('Success message hidden');
                }, 2000);

                // Change the state of the MultiState Box to 'manageProducts'
                $w('#box').changeState('manageProducts')
                    .then(() => {
                        console.log('State changed to: manageProducts');

                        // Reload products to ensure the repeater is updated
                        loadProducts(); // Ensure this function fetches and sets the data correctly
                    })
                    .catch((error) => {
                        console.error(`Failed to change state: ${error.message}`);
                    });
            })
            .catch((error) => {
                console.error('Error saving product:', error);
                $w('#loader').hide(); // Hide loader on error
            });
    });
});
*/



//////// UTILS.JS
/*
export function setupRepeaterSearch(database, inputId, repeaterId, searchField, noResultsFoundId) {
    const input = $w(`#${inputId}`);
    const repeater = $w(`#${repeaterId}`);

    input.onInput(() => {
        const searchText = input.value.trim().toLowerCase();

        if (searchText.length > 0) {
            filterRepeaterByText(database, searchText, searchField, repeater, noResultsFoundId);
        } else {
            loadAllItems(database, repeater, noResultsFoundId);
        }
    });

    loadAllItems(database, repeater, noResultsFoundId);
}

// Function to filter the repeater by text
function filterRepeaterByText(database, searchText, searchField, repeater, noResultsFoundId) {
    wixData.query(database)
        .contains(searchField, searchText)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                repeater.data = results.items;
                $w(`#${noResultsFoundId}`).collapse();
            } else {
                repeater.data = [];
                $w(`#${noResultsFoundId}`).expand();
            }
        })
        .catch((error) => {
            console.error(`Error searching items in ${database}:`, error);
        });
}

function filterRepeater(categoryId, subCategoryId, repeater, noResultsFoundId) {
    let query = wixData.query(constants.CUSTOMER_FAVOURITE_DATABASE);

    if (categoryId) {
        query = query.include('categoryId', categoryId);
    }

    if (subCategoryId) {
        query = query.include('subCategories', subCategoryId);
    }

    query.find()
        .then((results) => {
            if (results.items.length > 0) {
                repeater.data = results.items;
                $w(`#${noResultsFoundId}`).collapse();
            } else {
                repeater.data = [];
                $w(`#${noResultsFoundId}`).expand();
            }
        })
        .catch((error) => {
            console.error('Error loading customer favourites:', error);
        });
}

// Function to load all items from a specified database
export function loadAllItems(database, repeater, noResultsFoundId) {
    wixData.query(database)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                repeater.data = results.items;
                $w(`#${noResultsFoundId}`).collapse();
            } else {
                repeater.data = [];
                $w(`#${noResultsFoundId}`).expand();
            }
        })
        .catch((error) => {
            console.error(`Error loading items from ${database}:`, error);
        });
}


export function setupCategoryAndSubCategoryFiltering(categoryDropdownId, subCategoryDropdownId, repeaterId, noResultsFoundId) {
    const categoryDropdown = $w(`#${categoryDropdownId}`);
    const subCategoryDropdown = $w(`#${subCategoryDropdownId}`);
    const repeater = $w(`#${repeaterId}`);
 
    // Initialize subcategory dropdown without disabling it
    subCategoryDropdown.enable();

    // Fetch user's favorite products
    wixData.query(constants.CUSTOMER_FAVOURITE_DATABASE)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                const favoriteProductIds = results.items.map(item => item.productId);

                // Query for categories linked to favorite products
                wixData.query(constants.CATEGORIES_DATABASE)
                    .hasSome('Product_category', favoriteProductIds)
                    .find()
                    .then((categoryResults) => {
                        if (categoryResults.items.length > 0) {
                            const categories = [{ label: "All", value: "" }, ...categoryResults.items.map(category => ({
                                label: category.title,
                                value: category._id
                            }))];
                            categoryDropdown.options = categories;

                            // Handle category change
                            categoryDropdown.onChange(() => {
                                const selectedCategoryId = categoryDropdown.value;

                                // Query for subcategories linked to selected category and favorite products
                                wixData.query(constants.SUB_CATEGORIES_DATABASE)
                                    .hasSome('category', selectedCategoryId)
                                    .hasSome('Product_subCategory', favoriteProductIds)
                                    .find()
                                    .then((subCategoryResults) => {
                                        const subCategories = [{ label: "All", value: "" }, ...subCategoryResults.items.map(subCategory => ({
                                            label: subCategory.title,
                                            value: subCategory._id
                                        }))];
                                        subCategoryDropdown.options = subCategories;

                                        filterRepeater(selectedCategoryId, subCategoryDropdown.value, repeater, noResultsFoundId);
                                    })
                                    .catch((error) => {
                                        console.error('Error loading subcategories:', error);
                                    });
                            });

                            // Handle subcategory change
                            subCategoryDropdown.onChange(() => {
                                filterRepeater(categoryDropdown.value, subCategoryDropdown.value, repeater, noResultsFoundId);
                            });
                        }
                    })
                    .catch((error) => {
                        console.error('Error loading categories:', error);
                    });
            }
        })
        .catch((error) => {
            console.error('Error loading favorite products:', error);
        });
}


*/



/*

////////// LISTING BEGIN ////////////

    // Fetch data from both collections
    Promise.all([
            wixData.query("Centers").find(),
            wixData.query("Product").find()
        ])
        .then((results) => {
            console.log("Data fetched from both collections:", results);

            const centers = results[0].items.map(item => ({
                title: item.centerName,
                image: item.centerImage,
                date: item._createdDate,
                id: item._id,
                type: "Center" // To differentiate the type later if needed
            }));

            const products = results[1].items.map(item => ({
                title: item.productName,
                image: item.productImage,
                date: item._createdDate,
                id: item._id,
                type: "Product" // To differentiate the type later if needed
            }));

            console.log("Processed Centers data:", centers);
            console.log("Processed Products data:", products);

            // Combine both data arrays and assign to the broader scoped variable
            combinedData = centers.concat(products);

            console.log("Combined data for repeater:", combinedData);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });

    ////////// LISTING END ////////////
    
*/


////////////// URL PREFIX //////////////
//   const urlPrefix = "https://";
//   const businessWebsiteURL = $w("#businessWebsiteURL");

//   if (!businessWebsiteURL.value || businessWebsiteURL.value === "") {
//     businessWebsiteURL.value = urlPrefix;
//   }

//   businessWebsiteURL.onInput((event) => {
//     let value = event.target.value;

//     if (!value.startsWith(urlPrefix)) {
//       businessWebsiteURL.value = urlPrefix + value.slice(urlPrefix.length);
//     }

//     if (value.length < urlPrefix.length) {
//       businessWebsiteURL.value = urlPrefix;
//     }
//   });

//   businessWebsiteURL.onBlur(() => {
//     if (!businessWebsiteURL.value.startsWith(urlPrefix)) {
//       businessWebsiteURL.value = urlPrefix;
//     }
//   });

//   businessWebsiteURL.onFocus(() => {
//     let value = businessWebsiteURL.value;

//     if (value === urlPrefix) {
//       businessWebsiteURL.value = urlPrefix;
//     }
//   });

////////////// URL PREFIX END //////////////

////////////// FILTER SUB CATEGORY //////////////
// function filterSubCategories(
//   categoryDropdownId,
//   subCategoryDropdownId,
//   collectionName,
//   subCategoriesFieldName
// ) {
//   const selectedCategoryId = $w(categoryDropdownId).value;

//   if (!selectedCategoryId) {
//     console.warn("No category selected.");
//     return;
//   }

//   $w(subCategoryDropdownId).enable();

//   if (selectedCategoryId === "All") {
//     const dropdownOptions = [
//       {
//         label: "All",
//         value: "All",
//       },
//     ];
//     $w(subCategoryDropdownId).options = dropdownOptions;
//     $w(subCategoryDropdownId).value = "All";
//     console.log(
//       "Sub-category dropdown populated with only 'All' option:",
//       dropdownOptions
//     );
//   } else {
//     wixData
//       .query(collectionName)
//       .eq("_id", selectedCategoryId)
//       .include(subCategoriesFieldName)
//       .find()
//       .then((results) => {
//         if (results.items.length > 0) {
//           const category = results.items[0];
//           const subCategories = category[subCategoriesFieldName];

//           const dropdownOptions = subCategories.map((subCat) => ({
//             label: subCat.title,
//             value: subCat.title,
//           }));

//           $w(subCategoryDropdownId).options = dropdownOptions;
//           console.log(
//             "Sub-category dropdown populated with filtered options:",
//             dropdownOptions
//           );
//         } else {
//           $w(subCategoryDropdownId).options = [];
//           console.warn("No sub-categories found for the selected category.");
//         }
//       })
//       .catch((err) => {
//         console.error("Error filtering sub-categories:", err);
//       });
//   }
// }

////////////// FILTER SUB CATEGORY END //////////////

////////////// FILTER  CATEGORY START //////////////

// function populateCategoryDropdown(dropdownId, collectionName, fieldToDisplay) {
//   return wixData
//     .query(collectionName)
//     .ascending(fieldToDisplay)
//     .find()
//     .then((results) => {
//       const dropdownOptions = [
//         {
//           label: "All",
//           value: "All",
//         },
//       ];

//       dropdownOptions.push(
//         ...results.items.map((item) => ({
//           label: item[fieldToDisplay],
//           value: item[fieldToDisplay],
//         }))
//       );

//       $w(dropdownId).options = dropdownOptions;
//       $w(dropdownId).value = "All";
//       console.log("Category dropdown populated with options:", dropdownOptions);
//     })
//     .catch((err) => {
//       console.error("Error populating category dropdown:", err);
//     });
// }

////////////// FILTER  CATEGORY END //////////////