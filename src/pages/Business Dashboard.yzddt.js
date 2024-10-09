import wixData from "wix-data";
import wixUsers from "wix-users";
import wixLocationFrontend from "wix-location-frontend";
import { authentication, currentMember } from "wix-members-frontend";
import wixLocation from "wix-location";
import * as constants from "public/constants";
import { viewImageWhenUpload, viewVideoWhenUpload, getAllChildren } from "public/utils.js";
import { orders } from "wix-pricing-plans-frontend";
import {populateCategoryDropdown, populateSubCategoryDropdown, getSubCategoryBasedOnCategoryReference, getCategories} from 'public/categories'

const STATE_BOX_ID = /* @type {const} */ {
  HOME: "HOME",
  MEDIAHUB: "MEDIAHUB",
  PROFILE: "PROFILE",
  BILLING: "BILLING",
  CENTERS: "CENTERS",
  PRODUCTS: "PRODUCTS",
  ADDOREDITPRODUCT: "ADDOREDITPRODUCT"
};

/**@type {keyof STATE_BOX_ID} */
let CURRENT_PAGE = "HOME";

const PAGE = /* @type {const} */ {
  HOME: {
    $btn: $w("#btnHome"),
  },
  MEDIAHUB: {
    $btn: $w("#btnMediaHub"),
  },
  PROFILE: {
    $btn: $w("#btnProfile"),
  },
  BILLING: {
    $btn: $w("#btnBilling"),
  },
  CENTERS: {
    $btn: $w(
      "#btnCenters, #btnCenters1 #btnCenters2, #btnCenters4, #btnCenters5"
    ),
  },
  PRODUCTS: {
    $btn: $w(
      "#btnProducts, #btnProducts1, #btnProducts2, #btnProducts4, #btnProducts5, #btnListing"
    ),
  },
  // ADDOREDITPRODUCT: {
  //   $btn: $w('#addProduct')
  // }
};

const selectedButtonColor = "#E3E7EC", buttonColor = "#F7F9FB", hoverButtonColor = "#000000", hoverTextColor = "#ffffff";

// Products Variables
let isEditingProduct = false, editingProductId = null, productIsLive = true;
let specialDeals = [], experts = []

let selectedImages = [];
let selectedVideos = [];

let userId;

$w.onReady(async function () {
  userId = (await currentMember.getMember())._id;
  console.log("Version 6");
  await $w("#businessDataset").onReadyAsync();
  initSidebar();

  ///////// CHECK PRICING PLAN BEGIN //////////

  orders.listCurrentMemberOrders({ orderStatuses: ["ACTIVE"] })
    .then((ordersList) => {
      if (ordersList.length > 0) {
        const latestOrder = ordersList[0];
        const planName = latestOrder.planName;
        const planId = latestOrder.planId;

        console.log("Current Plan Name:", planName);
        console.log("Current Plan ID:", planId);
        setupPlanFields(planId);
      } else {
        setupPlanFields();
        console.log("Basic Plan assigned by default.");
      }
    })
    .catch((error) => {
      console.error("Error fetching member orders:", error);
    });

  ///////// CHECK PRICING PLAN END  //////////

  /* ======= Begin: PROFILE ======= */

  let currentBusiness = $w('#businessDataset').getCurrentItem()
  console.log("currentBusiness", currentBusiness);
  let categories = await getCategories()
  $w('#businessCategory').options = categories.items.map((item) => {return {label: item.title, value: item._id}})

  if(currentBusiness.category){
    $w('#businessCategory').value = currentBusiness.category
    let subCategory = await getSubCategoryBasedOnCategoryReference(currentBusiness.category)
    $w('#businessSubCategory').options = subCategory.items.map((item) => {return {label: item.title, value: item._id}})
    if(currentBusiness.subCategories){
      $w('#businessSubCategory').value = currentBusiness.subCategories
    }
  }

  $w("#updatePassword").onClick(() => {
    console.log("Prompting forgot password");
    authentication.promptForgotPassword();
  });

  $w("#businessDataset").setFieldValue("profileComplete", true);

  $w('#uploadProfilePicture').onChange(async () => {
    let profileImage = await viewImageWhenUpload($w("#uploadProfilePicture"),$w("#displayPicture"),$w("#errorMessage"))
    $w('#businessDataset').setFieldValue("picture", profileImage)
  })


  $w("#next").onClick(() => {
    $w("#contactInformationBox").scrollTo();
  });

  const urlPrefix = "https://";

  if (!$w("#businessWebsiteURL").value || $w("#businessWebsiteURL").value === "") {
    $w("#businessWebsiteURL").value = urlPrefix;
  }
  if (!$w("#businessSocialMedia").value || $w("#businessSocialMedia").value === "") {
    $w("#businessSocialMedia").value = urlPrefix;
  }

  $w('#businessCategory').onChange(async () => {
    let subCategory = await getSubCategoryBasedOnCategoryReference($w('#businessCategory').value)
    console.log("subCategory", subCategory);
    $w('#businessSubCategory').options = subCategory.items.map((item) => {return {label: item.title, value: item._id}})
    
    $w('#businessDataset').setFieldValue('categoriesTags', [($w('#businessCategory').options[$w('#businessCategory').selectedIndex]).label])
    $w('#businessDataset').setFieldValue('category',$w('#businessCategory').value)

  })

  $w('#businessSubCategory').onChange(() => {
    $w('#businessDataset').setFieldValue('subCategories', $w('#businessSubCategory').value)
    $w('#businessDataset').setFieldValue('subCategoriesTags', [($w('#businessSubCategory').options[$w('#businessSubCategory').selectedIndex]).label])

  })

  /* ======= End: PROFILE ======= */

  ///////// CENTERS ADD OR EDIT BEGIN /////////////

/*  
initRepeaterGallery({
    repeaterId: "#centersGalleryRepeater",
    elementId: "#centersGalleryRepeaterImage",
    deleteButtonId: "#centersGalleryRepeaterDeleteButton",
    uploadButtonId: "#uploadImageGalleryAddCenter",
    mediaType: 'image'
  });

  initRepeaterGallery({
    repeaterId: "#videoGalleryRepeaterCenters",
    elementId: "#videoGalleryRepeaterCentersVideo",
    deleteButtonId: "#videoGalleryRepeaterCentersDeleteButton",
    uploadButtonId: "#uploadVideoGalleryInputAddCenter",
    mediaType: 'video'
  });

  // const uploadCenterButton = $w("#uploadCenterDisplayImageButton");
  // const displayCenterElement = $w("#displayImageCenter");
  // const datasetCenter = $w("#businessDataset");
  // const errorMessageElementCenter = $w("#errorMessageCenter");

  // // setupRepeaterSearch('Centers', 'searchCenterInput', 'centersRepeater', 'centerName', 'noResultsFound');
  // viewImageWhenUpload(uploadCenterButton, displayCenterElement, datasetCenter, 'picture', errorMessageElementCenter);

  let isPublishCenterEnabled = $w("#publishCenter").enabled;

  const user = wixUsers.currentUser.id;
  let isEditingCenter = false;
  let editingCenterId = null;

  // Load centers associated with the current user
  function loadCenters() {
    wixData
      .query("Centers")
      .eq("business", user)
      .find()
      .then((results) => {
        $w("#centersRepeater").data = results.items;
      })
      .catch((err) => console.error(err));
  }

  loadCenters();

  $w("#addCenterButton").onClick(() => {
    console.log("Add Center Clicked");
    isEditingCenter = false;
    editingCenterId = null;
    resetCenterForm();

    $w("#businessDashboardMultiStateBox").changeState("ADDOREDITCENTER");
  });

  $w("#subCategoriesInputAddCenter").disable();

  $w("#categoriesInputAddCenter").onChange(() => {
    // filterSubCategories(
    //   "#categoriesInputAddCenter",
    //   "#subCategoriesInputAddCenter",
    //   "Categories",
    //   "Sub-Categories_category"
    // );
  });

  function resetCenterForm() {
    $w("#centerNameInputAddCenter").value = "";
    $w("#affiliateLinkInputAddCenter").value = "";
    $w("#shippingLocationsAddCenter").value = null;
    $w("#newsletterSignupLinkAddCenter").value = "";
    $w("#categoriesInputAddCenter").value = "";
    $w("#subCategoriesInputAddCenter").value = "";
    $w("#overviewInputAddCenter").value = "";
    $w("#mainCenterDisplayImage").src = constants.DEFAULT_ADD_PRODUCT_IMAGE;
    $w("#mainImageInputAddCenter").reset();
    $w("#feed1DisplayImageCenter").src = constants.DEFAULT_ADD_PRODUCT_IMAGE;
    $w("#feedImageInput1AddCenter").reset();
    $w("#feed2DisplayImageCenter").src = constants.DEFAULT_ADD_PRODUCT_IMAGE;
    $w("#feedImageInput2AddCenter").reset();
    $w("#centersGalleryRepeaterImage").src = constants.DEFAULT_ADD_PRODUCT_IMAGE;
    selectedImages = [];
    selectedVideos = [];
    $w("#uploadImageGalleryAddCenter").reset();
    // $w("#productImageGalleryRepeater").data = [];
    // $w("#mainVideoDisplay").src = '';
    $w("#uploadMainVideoAddCenter").reset();
    $w("#uploadVideoGalleryInputAddCenter").reset();
    // $w("#productVideoGalleryRepeater").data = [];
    // Reset catalogCenterImages for a new center
    // $w("#productMediaGalleryRepeater").data = [];
  }

  // // Handle center display and actions
  $w("#centersRepeater").onItemReady(($item, itemData) => {
    $item("#centerDisplayImage").src = itemData.centerImage;
    $item("#centerName").text = itemData.centerName;
    $item("#centerDescription").text = itemData.categories;

    $item("#editCenterButtonRepeater").onClick(() => {
      isEditingCenter = true;
      editingCenterId = itemData._id;
      console.log(itemData._id, "edit clicked");
      populateCenterForm(itemData);
      $w("#businessDashboardMultiStateBox").changeState("ADDOREDITCENTER");
    });

    $item("#deleteCenterButton").onClick(() => {
      wixData
        .remove("Centers", itemData._id)
        .then(() => loadCenters())
        .catch((err) => console.error(err));
    });
  });

  // // Populate form with existing center data for editing
  function populateCenterForm(itemData) {
    $w("#centerNameInputAddCenter").value = itemData.centerName;
    $w("#affiliateLinkInputAddCenter").value = itemData.affiliateLink;
    $w("#shippingLocationsAddCenter").value = itemData.shippingLocation;
    $w("#categoriesInputAddCenter").value = itemData.categories;
    $w("#subCategoriesInputAddCenter").value = itemData.subCategories;
    $w("#overviewInputAddCenter").value = itemData.overview;
    $w("#mainCenterDisplayImage").src = itemData.centerImage;
    $w("#feed1DisplayImageCenter").src = itemData.feedImage1;
    $w("#feed2DisplayImageCenter").src = itemData.feedImage2;
    $w("#videoMainCentersDisplay").src = itemData.mainVideo;

    // Initialize catalogCenterImages for the center being edited
    selectedImages = itemData.catalog || [];
    $w("#centersGalleryRepeater").data = selectedImages.map((src, index) => ({
      _id: index.toString(),
      src: src,
    }));
    selectedVideos = itemData.videoGallery || [];
    $w("#videoGalleryRepeaterCenters").data = selectedVideos.map(
      (src, index) => ({ _id: index.toString(), src: src })
    );
  }

  const mainDisplayCenterImage = $w("#mainCenterDisplayImage");
  const mainDisplayCenterImageButton = $w("#mainImageInputAddCenter");
  const addToCenterDatabase = $w("#centersDataset");
  const errorMainCenterDisplayImage = $w("#errorMainCenterDisplayImage");

  // main center image
  viewImageWhenUpload(mainDisplayCenterImageButton,mainDisplayCenterImage,addToCenterDatabase,"centerImage",errorMainCenterDisplayImage
  );

  // feed image 1 center
  const feedImage1DisplayCenter = $w("#feed1DisplayImageCenter");
  const feedImage1DisplayCenterButton = $w("#feedImageInput1AddCenter");
  const feed1DisplayImageError = $w("#feed1DisplayImageError");

  viewImageWhenUpload(
    feedImage1DisplayCenterButton,
    feedImage1DisplayCenter,
    addToCenterDatabase,
    "feedImage1",
    feed1DisplayImageError
  );

  // feed image 2 center
  const feedImage2DisplayCenter = $w("#feed2DisplayImageCenter");
  const feedImage2DisplayCenterButton = $w("#feedImageInput2AddCenter");
  const feed2DisplayImageError = $w("#feed2DisplayImageError");

  viewImageWhenUpload(
    feedImage2DisplayCenterButton,
    feedImage2DisplayCenter,
    addToCenterDatabase,
    "feedImage2",
    feed2DisplayImageError
  );

  const videoMainCentersDisplay = $w("#videoMainCentersDisplay");
  const uploadMainVideoAddCenter = $w("#uploadMainVideoAddCenter");

  viewVideoWhenUpload(
    uploadMainVideoAddCenter,
    videoMainCentersDisplay,
    addToCenterDatabase,
  );

  // Save or update center data
  $w("#publishCenter").onClick(() => {
    $w("#publishCenter").disable();
    setTimeout(() => $w("#publishCenter").enable(), 2500);
    $w("#publishCenterButtonPreLoader").show();

    const newCenter = {
      centerName: $w("#centerNameInputAddCenter").value,
      affiliateLink: $w("#affiliateLinkInputAddCenter").value,
      shippingLocation: $w("#shippingLocationsAddCenter").value,
      newsLetterSignUpLink: $w("#newsletterSignupLinkAddCenter").value,
      categories: $w("#categoriesInputAddCenter").value,
      subCategories: $w("#subCategoriesInputAddCenter").value,
      overview: $w("#overviewInputAddCenter").value,
      centerImage: $w("#mainCenterDisplayImage").src,
      feedImage1: $w("#feed1DisplayImageCenter").src,
      feedImage2: $w("#feed2DisplayImageCenter").src,
      mainVideo: $w("#videoMainCentersDisplay").src,
      videoGallery: selectedVideos,
      catalog: selectedImages,
      business: user,
    };

    const savePromise = isEditingCenter
      ? wixData.update("Centers", { _id: editingCenterId, ...newCenter })
      : wixData.insert("Centers", newCenter);

    savePromise
      .then(() => {
        $w("#successCenterSaving").show();
        setTimeout(() => {
          $w("#successCenterSaving").hide();
          $w("#businessDashboardMultiStateBox").changeState("CENTERS");
          loadCenters();
        }, 2000);
      })
      .catch((err) => {
        $w("#errorCenterSaving").show();
        setTimeout(() => $w("#errorCenterSaving").hide(), 2000);
        console.error(err);
      });
  });

  // // Handle image upload and update the gallery
  // $w("#uploadGalleryButton").onChange(() => {
  //     let files = $w("#uploadGalleryButton").value;
  //     if (files.length > 0) {
  //         $w("#uploadGalleryButton").uploadFiles()
  //             .then((uploadedFiles) => {
  //                 let uploadedFileUrls = uploadedFiles.map(file => file.fileUrl);
  //                 catalogCenterImages = catalogCenterImages.concat(uploadedFileUrls);
  //                 console.log("catalogCenterImages", catalogCenterImages);
  //                 $w("#mediaGalleryRepeater").data = catalogCenterImages.map((src, index) => ({ _id: index.toString(), src: src }));
  //             })
  //             .catch((uploadError) => {
  //                 console.error('File upload error:', uploadError);
  //             });
  //     }
  // });

  // // Handle image deletion from the gallery
  // $w("#mediaGalleryRepeater").onItemReady(($item, itemData) => {
  //     $item("#mediaGalleryRepeaterImage").src = itemData.src;
  //     $item("#deleteMediaGalleryRepeaterImage").onClick(() => {
  //         catalogCenterImages = catalogCenterImages.filter((src) => src !== itemData.src);
  //         $w("#mediaGalleryRepeater").data = catalogCenterImages.map((src, i) => ({ _id: i.toString(), src: src }));
  //     });
  // });


  ///////// CENTERS ADD OR EDIT END /////////////

  //////// EXPERTS BEGIN ///////////////

  const expertsImageUploadAddCenter = $w("#expertsImageUploadAddCenter");
  const expertsImageAddCenter = $w("#expertsImageUploadAddCenter");
  const expertsErrorMessageAddCenter = $w("#expertsErrorMessageAddCenter");

  viewImageWhenUpload(
    expertsImageUploadAddCenter,
    expertsImageAddCenter,
    addToCenterDatabase,
    "experts",
    expertsErrorMessageAddCenter
  );
*/
  //////// EXPERTS END ///////////////

  ////////// PRODUCTS ////////////
  $w("#searchProductInput").onInput(() => {
    filterRepeater("#productDataset", "#searchProductInput");
  });

  

  let productCategories = await getCategories()
  $w('#productCategoryDropdown').options = productCategories.items.map((item) => {return {label: item.title, value: item._id}})

  $w('#productCategoryDropdown').onChange(async () => {
    filterRepeater("#productDataset", "#searchProductInput", $w('#productCategoryDropdown').value);
    let subCategory = await getSubCategoryBasedOnCategoryReference($w('#productCategoryDropdown').value)
    $w('#productSubCategoryDropdown').options = subCategory.items.map((item) => {return {label: item.title, value: item._id}})
  })

  $w('#productSubCategoryDropdown').onChange(() => {
    filterRepeater("#productDataset", "#searchProductInput", $w('#productCategoryDropdown').value, $w('#productSubCategoryDropdown').value);
  })  

  $w("#addProduct").onClick(() => {
    $w('#businessDashboardMultiStateBox').changeState('ADDOREDITPRODUCT')
    resetProductForm();
  });

  //////// PRODUCT ADD OR EDIT BEGIN ////////////


  initRepeaterGallery({
    repeaterId: "#productImageGalleryRepeater",
    elementId: "#productImageGalleryRepeaterImage",
    deleteButtonId: "#productImageGalleryRepeaterDeleteButton",
    uploadButtonId: "#uploadImageGalleryAddProduct",
    mediaType: "image"
  });

  initRepeaterGallery({
    repeaterId: "#productVideoGalleryRepeater",
    elementId: "#productVideoGalleryRepeaterVideo",
    deleteButtonId: "#productVideoGalleryRepeaterDelete",
    uploadButtonId: "#uploadVideoGalleryInputAddProduct",
    mediaType: "video"
  });

  let healthGoals = await getCategories(constants.HEALTH_GOALS_DATABASE)
  $w('#healthGoalsInputAddProduct').options = healthGoals.items.map((item) => {return {label: item.title, value: item._id}})

  $w('#categoriesInputAddProduct').options = productCategories.items.map((item) => {return {label: item.title, value: item._id}})

  $w('#healthGoalsInputAddProduct').onChange(async () => {
    let categoriesBasedOnHealthGoals = await getCategories(constants.HEALTH_GOALS_DATABASE, wixData.query(constants.HEALTH_GOALS_DATABASE).include('categories').eq('_id', $w('#healthGoalsInputAddProduct').value))
    $w('#categoriesInputAddProduct').options = categoriesBasedOnHealthGoals.items[0].categories.map((item) => {return {label: item.title, value: item._id}})
  })

  $w('#categoriesInputAddProduct').resetValidityIndication()

  let allSubCategories = await getCategories('Sub-Categories')
  $w('#subCategoriesInputAddProduct').options = allSubCategories.items.map((item) => {return {label: item.title, value: item._id}})

  $w('#categoriesInputAddProduct').onChange(async () => {
    let subCategory = await getSubCategoryBasedOnCategoryReference($w('#categoriesInputAddProduct').value)
    $w('#subCategoriesInputAddProduct').options = subCategory.items.map((item) => {return {label: item.title, value: item._id}})
  })

  /////// Special Deals //////
  //Special Deal 1
  $w('#specialDealsUploadAddProduct1').onChange(async () => {
    let specialDealImage = await viewImageWhenUpload($w('#specialDealsUploadAddProduct1'), $w('#specialDealImageAddProduct1'), $w('#specialDealsErrorMessage'))
    // $w('#specialDealImageAddProduct1').src = specialDealImage
  })
  $w('#deleteSpecialDealsAddProduct1').onClick(() => {
    $w('#specialDealImageAddProduct1').src = constants.DEFAULT_ADD_PRODUCT_IMAGE
  })


  //Special Deal 2
  $w('#specialDealsUploadAddProduct2').onChange(async () => {
    let specialDealImage = await viewImageWhenUpload($w('#specialDealsUploadAddProduct2'), $w('#specialDealImageAddProduct2'), $w('#specialDealsErrorMessage'))
    // $w('#specialDealImageAddProduct2').src = specialDealImage
  })
  $w('#deleteSpecialDealsAddProduct2').onClick(() => {
    $w('#specialDealImageAddProduct2').src = constants.DEFAULT_ADD_PRODUCT_IMAGE
  })


  //Special Deal 3
  $w('#specialDealsUploadAddProduct3').onChange(async () => {
    let specialDealImage = await viewImageWhenUpload($w('#specialDealsUploadAddProduct3'), $w('#specialDealImageAddProduct3'), $w('#specialDealsErrorMessage'))
    // $w('#specialDealImageAddProduct3').src = specialDealImage
  })
  $w('#deleteSpecialDealsAddProduct3').onClick(() => {
    $w('#specialDealImageAddProduct3').src = constants.DEFAULT_ADD_PRODUCT_IMAGE
  })
 


  // Experts //
  //////// View and Upload function parameters/////////
  $w('#expertsAddProductRepeater').onItemReady(($item, itemData, index) => {
    $item('#expertImageAddProduct4').src = itemData.expertImage
    $item('#expertNameAddProduct4').value = itemData.expertName
    $item('#expertRoleAddProduct4').value = itemData.expertRole
    // $ite
  })
  $w('#expertsAddProductRepeater').forEachItem(($item, itemData, index) => {
    $item('#expertUploadAddProduct4').onChange(() => {
      let expertImage = viewImageWhenUpload($item('#expertUploadAddProduct4'), $item('#expertImageAddProduct4'), $item('#expertErrorAddProduct4'))
      itemData.expertImage = expertImage
    })

    $item('#expertNameAddProduct4').onInput(() => {
      itemData.expertName = $item('#expertNameAddProduct4').value
    })

    $item('#expertRoleAddProduct4').onInput(() => {
      itemData.expertRole = $item('#expertRoleAddProduct4').value
    })
  })

  //main image
  $w('#mainImageInputAddProduct').onChange(() => {
    viewImageWhenUpload($w("#mainImageInputAddProduct"),$w("#mainProductDisplayImage"),$w("#errorMessageDisplayImage"))
  })
  
  // feed image 1
  $w("#feedImageInput1AddProduct").onChange(() => {viewImageWhenUpload($w("#feedImageInput1AddProduct"),$w("#feedImage1DisplayImage"), $w("#errorMessageFeedImage1"))})

  //feed image 2
  $w('#feedImageInput2AddProduct').onChange(() => {viewImageWhenUpload($w("#feedImageInput2AddProduct"),$w("#feedImage2DisplayImage"),$w("#errorMessageFeedImage2"))})

  // video main
  $w('#uploadMainVideoAddProduct').onChange(async () => {
    let mainVideo = await viewVideoWhenUpload($w("#uploadMainVideoAddProduct"),$w("#mainVideoDisplay"),$w("#errorMessageVideoUpload"));
    console.log("mainVideo", mainVideo);
  })

  $w("#publishProduct").onClick(() => {
    $w("#publishProduct").disable();
    $w("#publishProduct").label = "";
    setTimeout(() => $w("#publishProduct").enable(), 2500);
    $w("#publishProductLoader").show();
    setTimeout(() => $w("#publishProductLoader").hide(), 2500);
    setTimeout(() => ($w("#publishProduct").label = "Publish"), 2500);

    

    const productName = $w("#productNameInputAddProduct").value;
    const shippingLocations = $w("#shippingLocationsAddProduct").value;
    const category = $w("#categoriesInputAddProduct").value;
    const subCategory = $w("#subCategoriesInputAddProduct").value;
    const productImage = $w("#mainProductDisplayImage").src;

    if (!productName ||!shippingLocations ||!category ||!subCategory ||!productImage) {
      $w("#errorMessageAddProduct").text = "Please fill in all the required fields.";
      $w("#errorMessageAddProduct").expand();
      setTimeout(() => $w("#errorMessageAddProduct").collapse(), 2000);
      return;
    }

    const newProduct = {
      productName: $w("#productNameInputAddProduct").value,
      affiliateLink: $w("#affiliateLinkInputAddProduct").value,
      shippingLocations: $w("#shippingLocationsAddProduct").value,
      newsletterSignupLink: $w("#newsletterSignupLinkAddProduct").value,
      healthGoals: $w('#healthGoalsInputAddProduct').value,
      category: $w("#categoriesInputAddProduct").value,
      subCategory: $w("#subCategoriesInputAddProduct").value,
      overview: $w("#overviewInputAddProduct").value,
      productCatalog: selectedImages,
      videoGallery: selectedVideos,
      productImage: $w("#mainProductDisplayImage").src,
      feedImage1: $w("#feedImage1DisplayImage").src,
      feedImage2: $w("#feedImage2DisplayImage").src,
      mainVideo: $w('#mainVideoDisplay').src,
      business: userId,
      productStatus: productIsLive,
      socialMediaLink: $w('#socialMediaLinksAddProduct').value,
      specialDeals1: $w('#specialDealImageAddProduct1').src,
      specialDeals2: $w('#specialDealImageAddProduct2').src,
      specialDeals3: $w('#specialDealImageAddProduct3').src,
      experts: $w('#expertsAddProductRepeater').data
    };

    console.log("New Product Data: ", newProduct);

    const savePromise = isEditingProduct ? wixData.update(constants.PRODUCT_DATABASE, {_id: editingProductId,...newProduct,})
      : wixData.insert(constants.PRODUCT_DATABASE, newProduct);

    savePromise
      .then((res) => {
        console.log("Product saved successfully.");
        // if(isEditingProduct){
        //   wixData.bulkUpdate
        // }
        // let newExperts = [{"fullName": $w('#expertNameAddProduct1').value, "role": $w('#expertRoleAddProduct1'), "image": $w('#expertImageAddProduct1').src, "products": }]
        $w("#successMessageAddProduct").expand();
        setTimeout(() => {
          $w("#successMessageAddProduct").collapse();
          $w("#businessDashboardMultiStateBox").changeState("PRODUCTS");
          $w("#productDataset").refresh();
        }, 2000);
      })
      .catch((err) => {
        console.error("Error saving product:", err);
        $w("#errorMessageAddProduct").expand();
        setTimeout(() => $w("#errorMessageAddProduct").collapse(), 2000);
      });
  });

  //////// PRODUCT ADD OR EDIT END ////////////


  ///////// BEGIN PRODUCTS ////////////
  $w("#productRepeater").onItemReady(($item, itemData) => {
    $item("#productImage").src = itemData.productImage;
    $item("#productName").text = itemData.productName;
    $item("#productCategory").text = itemData.categoryTags;

    $item("#editProduct").onClick(() => {
      isEditingProduct = true;
      $w('#subCategoriesInputAddProduct').enable()
      editingProductId = itemData._id;
      populateProductForm(itemData);
      $w("#businessDashboardMultiStateBox").changeState("ADDOREDITPRODUCT");
    });
  });
  /////////// END PRODUCTS //////////////


});

function resetProductForm() {
    isEditingProduct = false;
    editingProductId = null;
    let allAddProductElements = getAllChildren($w('#ADDOREDITPRODUCT'));
    let allAddProductInputElements = allAddProductElements.filter(item => item.type === '$w.TextInput' || item.type === '$w.TextBox');
    let allAddProductDropdownElements = allAddProductElements.filter(item => item.type === '$w.Dropdown');
    let allAddProductButtonElements = allAddProductElements.filter(item => item.type === '$w.Button');
    let allAddProductUploadButtonElements = allAddProductElements.filter(item => item.type === '$w.UploadButton');

    let exceptionElements = [$w('#companyNameInputAddProduct'), $w('#emailInputAddProduct'), $w('#phoneNumberInputAddProduct')]
    let addProductInputElements = allAddProductInputElements.filter(item => exceptionElements.includes(item))

    addProductInputElements.forEach(elem => elem.value = "")
    allAddProductDropdownElements.forEach((elem) => {elem.value = undefined; elem.resetValidityIndication()})
    allAddProductUploadButtonElements.forEach(elem => elem.reset())

    let imageElements = [$w('#mainProductDisplayImage'), $w('#feedImage1DisplayImage'), $w('#feedImage2DisplayImage'), $w('#productImageGalleryRepeaterImage')]
    imageElements.forEach(elem => elem.src = constants.DEFAULT_ADD_PRODUCT_IMAGE)

    selectedImages = selectedVideos = specialDeals = experts = [];
  }

function populateProductForm(itemData) {
    $w("#productNameInputAddProduct").value = itemData?.productName;
    $w("#affiliateLinkInputAddProduct").value = itemData?.affiliateLink;
    $w("#shippingLocationsAddProduct").value = itemData?.shippingLocations;
    $w("#newsletterSignupLinkAddProduct").value = itemData?.newsletterSignupLink;
    $w("#categoriesInputAddProduct").value = itemData?.category;
    $w("#healthGoalsInputAddProduct").value = itemData?.healthGoals;
    $w("#subCategoriesInputAddProduct").value = itemData?.subCategory;
    $w("#mainProductDisplayImage").src = itemData?.productImage;
    $w("#feedImage1DisplayImage").src = itemData?.feedImage1;
    $w("#feedImage2DisplayImage").src = itemData?.feedImage2;
    $w("#specialDealImageAddProduct1").src = itemData?.specialDeals1;
    $w("#specialDealImageAddProduct2").src = itemData?.specialDeals2;
    $w("#specialDealImageAddProduct3").src = itemData?.specialDeals3;
    $w("#overviewInputAddProduct").value = itemData?.overview;
    $w('#socialMediaLinksAddProduct').value = itemData?.socialMediaLink
    selectedImages = itemData.productCatalog || [];
    $w("#productImageGalleryRepeater").data = selectedImages;
    $w("#mainVideoDisplay").src = itemData?.mainVideo;
    $w('#expertsAddProductRepeater').data = itemData?.experts
    // $w('#specialDealsAddProductRepeater').data = itemData?.specialDeals
  }

function initRepeaterGallery({repeaterId,elementId,deleteButtonId,uploadButtonId,mediaType}) {
  $w(repeaterId).onItemReady(($item, itemData) => {
    $item(elementId).src = itemData.src || constants.DEFAULT_ADD_PRODUCT_IMAGE;

    $item(deleteButtonId).onClick(() => {
      selectedImages = selectedImages.filter(
        (image) => image._id !== itemData._id
      );
      console.log("Updated selected images after deletion:", selectedImages);
      updateRepeaterData(repeaterId, constants.DEFAULT_ADD_PRODUCT_IMAGE);
    });
  });

  $w(uploadButtonId).onChange(() => {
    uploadMedia(uploadButtonId, repeaterId, constants.DEFAULT_ADD_PRODUCT_IMAGE, mediaType);
  });

  if(isEditingProduct){
    updateRepeaterData(repeaterId, constants.DEFAULT_ADD_PRODUCT_IMAGE);
  }
}

function uploadMedia(uploadButtonId, repeaterId, image, mediaType) {
  $w(uploadButtonId)
    .uploadFiles()
    .then((uploadedFiles) => {
      uploadedFiles.forEach((file, index) => {
        selectedImages.push({
          _id: `item-${Date.now()}-${index}`,
          src: file.fileUrl,
          title: file.fileName,
          description: "",
          type: mediaType,
          slug: `item-${Date.now()}-${index}`,
          alt: "",
        });
      });

      updateRepeaterData(repeaterId, image);
    })
    .catch((uploadError) => {
      console.error("Error uploading images:", uploadError);
    });
}

function updateRepeaterData(repeaterId, image) {
  if (selectedImages.length === 0) {
    $w(repeaterId).data = [{ _id: "placeholder", src: image }];
  } else {
    $w(repeaterId).data = selectedImages;
  }
  $w(repeaterId).show();
}

function setupPlanFields(planId) {
  const basicFeatures = [
    // add product features
    $w("#companyNameInputAddProduct"),
    $w("#productNameInputAddProduct"),
    $w("#affiliateLinkInputAddProduct"),
    $w("#shippingLocationsAddProduct"),
    $w("#categoriesInputAddProduct"),
    $w("#subCategoriesInputAddProduct"),
    $w("#overviewInputAddProduct"),
    $w("#mainImageInputAddProduct"),
    $w("#feedImageInput1AddProduct"),
    $w("#feedImageInput2AddProduct"),

    // add center features
    $w("#companyNameInputAddCenter"),
    $w("#centerNameInputAddCenter"),
    $w("#affiliateLinkInputAddCenter"),
    $w("#shippingLocationsAddCenter"),
    $w("#categoriesInputAddCenter"),
    $w("#subCategoriesInputAddCenter"),
    $w("#overviewInputAddCenter"),
    $w("#mainImageInputAddCenter"),
    $w("#feedImageInput1AddCenter"),
    $w("#feedImageInput2AddCenter"),
  ];

  const essentialsFeatures = [
    // add product features
    $w("#emailInputAddProduct"),
    $w("#phoneNumberInputAddProduct"),
    $w("#socialMediaLinksAddProduct"),
    $w("#specialFeaturesInputAddProduct"),
    $w("#characteristicsInputAddProduct"),
    $w("#benefitsInputAddProduct"),
    $w("#healthGoalsInputAddProduct"),
    $w("#uploadImageGalleryAddProduct"),
    // $w("#expertsImageUploadAddProduct"),
    // $w("#expertsFullNameInputAddProduct"),
    // $w("#expertsRoleInputAddProduct"),

    // add center features
    $w("#emailInputAddCenter"),
    $w("#phoneNumberInputAddCenter"),
    $w("#socialMediaLinksAddCenter"),
    $w("#specialFeaturesInputAddCenter"),
    $w("#characteristicsInputAddCenter"),
    $w("#benefitsInputAddCenter"),
    $w("#healthGoalsInputAddCenter"),
    $w("#uploadImageGalleryAddCenter"),
    $w("#expertsImageUploadAddCenter"),
    $w("#expertsFullNameInputAddCenter"),
    $w("#expertsRoleInputAddCenter"),
  ];

  const proFeatures = [
    // add product features
    $w("#emailInputAddProduct"),
    $w("#phoneNumberInputAddProduct"),
    $w("#socialMediaLinksAddProduct"),
    $w("#specialFeaturesInputAddProduct"),
    $w("#characteristicsInputAddProduct"),
    $w("#benefitsInputAddProduct"),
    $w("#healthGoalsInputAddProduct"),
    $w("#uploadImageGalleryAddProduct"),
    // $w("#expertsImageUploadAddProduct"),
    // $w("#expertsFullNameInputAddProduct"),
    // $w("#expertsRoleInputAddProduct"),

    // add center features
    $w("#emailInputAddCenter"),
    $w("#phoneNumberInputAddCenter"),
    $w("#socialMediaLinksAddCenter"),
    $w("#specialFeaturesInputAddCenter"),
    $w("#characteristicsInputAddCenter"),
    $w("#benefitsInputAddCenter"),
    $w("#healthGoalsInputAddCenter"),
    $w("#uploadImageGalleryAddCenter"),
    $w("#expertsImageUploadAddCenter"),
    $w("#expertsFullNameInputAddCenter"),
    $w("#expertsRoleInputAddCenter"),
  ];

  const premiumFeatures = [
    // add product features
    $w("#newsletterSignupLinkAddProduct"),
    $w("#uploadMainVideoAddProduct"),
    $w("#uploadVideoGalleryInputAddProduct"),
    $w("#documentsUploadInputAddProduct"),
    $w("#specialDealsUploadAddProduct1"),
    $w("#specialDealsUploadAddProduct2"),
    $w("#specialDealsUploadAddProduct3"),

    // add center features
    $w("#newsletterSignupLinkAddCenter"),
    $w("#uploadMainVideoAddCenter"),
    $w("#uploadVideoGalleryInputAddCenter"),
    $w("#documentsUploadInputAddCenter"),
    $w("#specialDealsAddButtonAddCenter"),
  ];

  const allFields = [
    ...basicFeatures,
    ...essentialsFeatures,
    ...proFeatures,
    ...premiumFeatures,
  ];

  const upgradeButtons = [
    $w("#upgradeToPro"),
    $w("#upgradeToPro1"),
    $w("#upgradeToPro2"),
    $w("#upgradeToPremium"),
    $w("#upgradeToPremium1"),
    $w("#upgradeToPremium2"),
    $w("#upgradeToPremium3"),
  ];

  const upgradePlanPageRedirect = () => {
    wixLocation.to(constants.PRICING_PLANS_PAGE);
  };

  upgradeButtons.forEach((button) => button.onClick(upgradePlanPageRedirect));

  allFields.forEach((field) => field.disable());

  basicFeatures.forEach((field) => field.enable());

  upgradeButtons.forEach((button) => button.show());

  if (planId === constants.ESSENTIALS_PLAN) {
    essentialsFeatures.forEach((field) => field.enable());
    $w("#upgradeToPro").hide();
    $w("#upgradeToPro1").hide();
    $w("#upgradeToPro2").hide();
    $w("#upgradeToPremium").show();
    $w("#upgradeToPremium1").show();
    $w("#upgradeToPremium2").show();
    $w("#upgradeToPremium3").show();
  }

  if (planId === constants.PRO_PLAN) {
    essentialsFeatures.forEach((field) => field.enable());
    proFeatures.forEach((field) => field.enable());
    $w("#upgradeToPro").hide();
    $w("#upgradeToPro1").hide();
    $w("#upgradeToPro2").hide();
    $w("#upgradeToPremium").show();
    $w("#upgradeToPremium1").show();
    $w("#upgradeToPremium2").show();
    $w("#upgradeToPremium3").show();
  }

  if (planId === constants.PREMIUM_PLAN) {
    essentialsFeatures.forEach((field) => field.enable());
    proFeatures.forEach((field) => field.enable());
    premiumFeatures.forEach((field) => field.enable());
    $w("#upgradeToPro").hide();
    $w("#upgradeToPro1").hide();
    $w("#upgradeToPro2").hide();
    $w("#upgradeToPremium").hide();
    $w("#upgradeToPremium1").hide();
    $w("#upgradeToPremium2").hide();
    $w("#upgradeToPremium3").hide();
  }
}

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

  $w("#businessDashboardMultiStateBox").changeState(CURRENT_PAGE);
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

function filterRepeater(dataset, searchInput, category = null, subCategory = null) {
  const searchText = $w(searchInput).value.trim().toLowerCase(); // Ensure searchText is trimmed and lowercase

  console.log(searchText);

  let filter = wixData.filter().eq("_owner", userId);

  // Apply search filter
  if (searchText) {
    filter = filter.contains("productName", searchText)
  }

  if(category){
    filter = filter.eq('category', category)
  }

  if(subCategory){
    filter = filter.eq('subCategory', subCategory)
  }


  // console.log(filter);
  $w(dataset).setFilter(filter)
    .then(() => {
      // Write code to dislay count
      if($w('#productDataset').getTotalCount() === 0){
        $w('#noProductsFoundText').show()
      }else{
        $w('#noProductsFoundText').hide()
      }

    });
}
