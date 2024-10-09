// import wixData from 'wix-data';
// import { orders } from "wix-pricing-plans-frontend";
// import * as constants from 'public/constants';
// import { currentMember } from "wix-members-frontend";

// let selectedCategories = [];
// let selectedSubCategories = [];

// $w.onReady(() => {
//     orders.listCurrentMemberOrders()
//         .then((ordersList) => {
//             if (ordersList.length > 0) {
//                 const latestOrder = ordersList[0];
//                 const planName = latestOrder.planName;
//                 const planId = latestOrder.planId;

//                 // Set up fields based on the plan
//                 $w("#planNameText").text = planName;
//                 $w("#planIdText").text = planId;
//                 setupPlanFields(planId);
//             } else {
//                 console.log("No plan found for the current user.");
//                 $w("#planNameText").text = "No plan found";
//                 $w("#planIdText").text = "N/A";
//             }
//         })
//         .catch((error) => {
//             console.error("Error fetching member orders:", error);
//             $w("#planNameText").text = "Error retrieving plan";
//             $w("#planIdText").text = "N/A";
//         });

//     $w("#categorySelectionRepeater").collapse();
//     $w("#subCategorySelectionRepeater").collapse();
//     $w("#selectedCategoryTags").collapse();
//     $w("#selectedSubCategoryTags").collapse();

//     $w("#categoryInput").onFocus(() => {
//         $w("#categorySelectionRepeater").expand();
//     });

//     $w("#subCategoryInput").onFocus(() => {
//         $w("#subCategorySelectionRepeater").expand();
//     });

//     $w("#selectedCategoryTags").onClick(() => {
//         $w("#selectedCategoryTags").expand();
//     });

//     $w("#selectedSubCategoryTags").onClick(() => {
//         $w("#selectedSubCategoryTags").expand();
//     });

//     wixData.query("Categories")
//         .find()
//         .then((results) => {
//             $w("#categorySelectionRepeater").data = results.items;
//         });

//     $w("#categorySelectionRepeater").onItemReady(($item, itemData) => {
//         $item("#categorySelectionCheckbox").label = itemData.title;

//         $item("#categorySelectionCheckbox").onChange(() => {
//             if ($item("#categorySelectionCheckbox").checked) {
//                 selectedCategories.push(itemData._id);
//                 $w('#subCategorySelectionRepeater').expand();
//             } else {
//                 selectedCategories = selectedCategories.filter((id) => id !== itemData._id);
//                 if (selectedCategories.length === 0) {
//                     $w('#subCategorySelectionRepeater').collapse();
//                 }
//             }
//             updateCategoryTags();
//             filterSubCategories();
//         });
//     });

//     $w("#categoryInput").onInput((event) => {
//         let searchValue = event.target.value.toLowerCase();
//         filterCategories(searchValue);
//     });

//     wixData.query("Sub-Categories")
//         .find()
//         .then((results) => {
//             $w("#subCategorySelectionRepeater").data = results.items;
//         });

//     $w("#subCategorySelectionRepeater").onItemReady(($item, itemData) => {
//         $item("#subCategorySelectionCheckbox").label = itemData.title;

//         $item("#subCategorySelectionCheckbox").onChange(() => {
//             if ($item("#subCategorySelectionCheckbox").checked) {
//                 selectedSubCategories.push(itemData._id);
//             } else {
//                 selectedSubCategories = selectedSubCategories.filter((id) => id !== itemData._id);
//             }
//             updateSubCategoryTags();
//         });
//     });

//     $w("#subCategoryInput").onInput((event) => {
//         let searchValue = event.target.value.toLowerCase();
//         filterSubCategories(searchValue);
//     });

//     $w("#selectedCategoryTags").onClick(($item, itemData) => {
//         $item("#tagRemoveButton").onClick(() => {
//             removeCategoryTag(itemData.title);
//         });
//     });

//     $w("#selectedSubCategoryTags").onClick(($item, itemData) => {
//         $item("#tagRemoveButton").onClick(() => {
//             removeSubCategoryTag(itemData.title);
//         });
//     });

//     $w("#saveButton").onClick(() => {
//         saveSelectedItems(selectedCategories, selectedSubCategories);
//     });
// });

// function setupPlanFields(planId) {
//     // Access the fields
//     const basicPlanInput = $w("#basicPlanInput");
//     const essentialsPlanInput = $w("#essentialsPlanInput");
//     const proPlanInput = $w("#proPlanInput");
//     const premiumPlanInput = $w("#premiumPlanInput");

//     // Disable all fields by default
//     basicPlanInput.disable();
//     essentialsPlanInput.disable();
//     proPlanInput.disable();
//     premiumPlanInput.disable();

//     // Enable fields based on the user's plan
//     switch (planId) {
//     case constants.BASIC_PLAN:
//         basicPlanInput.enable();
//         break;
//     case constants.ESSENTIALS_PLAN:
//         basicPlanInput.enable();
//         essentialsPlanInput.enable();
//         break;
//     case constants.PRO_PLAN:
//         basicPlanInput.enable();
//         essentialsPlanInput.enable();
//         proPlanInput.enable();
//         break;
//     case constants.PREMIUM_PLAN:
//         basicPlanInput.enable();
//         essentialsPlanInput.enable();
//         proPlanInput.enable();
//         premiumPlanInput.enable();
//         break;
//     default:
//         console.log("Unknown plan ID");
//     }
// }

// function filterCategories(searchValue) {
//     wixData.query("Categories")
//         .contains("title", searchValue)
//         .find()
//         .then((results) => {
//             $w("#categorySelectionRepeater").data = results.items;
//         });
// }

// function filterSubCategories(searchValue = "") {
//     let query = wixData.query("Sub-Categories");

//     if (selectedCategories.length > 0) {
//         query = query.hasSome("category", selectedCategories);
//     }

//     if (searchValue) {
//         query = query.contains("title", searchValue);
//     }

//     query.find()
//         .then((results) => {
//             $w("#subCategorySelectionRepeater").data = results.items;
//         });
// }

// function updateCategoryTags() {
//     wixData.query("Categories")
//         .hasSome("_id", selectedCategories)
//         .find()
//         .then((results) => {
//             const selectedTitles = results.items.map((item) => item.title);
//             $w("#selectedCategoryTags").options = selectedTitles.map(title => ({ label: title, value: title }));
//             $w("#selectedCategoryTags").expand();
//         });
// }

// function updateSubCategoryTags() {
//     wixData.query("Sub-Categories")
//         .hasSome("_id", selectedSubCategories)
//         .find()
//         .then((results) => {
//             const selectedTitles = results.items.map((item) => item.title);
//             $w("#selectedSubCategoryTags").options = selectedTitles.map(title => ({ label: title, value: title }));
//             $w("#selectedSubCategoryTags").expand();
//         });
// }

// function removeCategoryTag(tagTitle) {
//     wixData.query("Categories")
//         .contains("title", tagTitle)
//         .find()
//         .then((results) => {
//             let tagId = results.items[0]._id;
//             selectedCategories = selectedCategories.filter((id) => id !== tagId);
//             updateCategoryTags();
//             filterSubCategories();
//         });
// }

// function removeSubCategoryTag(tagTitle) {
//     wixData.query("Sub-Categories")
//         .contains("title", tagTitle)
//         .find()
//         .then((results) => {
//             let tagId = results.items[0]._id;
//             selectedSubCategories = selectedSubCategories.filter((id) => id !== tagId);
//             updateSubCategoryTags();
//         });
// }

// function saveSelectedItems(selectedCategories, selectedSubCategories) {
//     const options = { fieldsets: ['FULL'] };

//     currentMember.getMember(options)
//         .then((member) => {
//             const userEmail = member.loginEmail;
//             console.log("Current User:", userEmail);

//             return wixData.query("Business")
//                 .eq("email", userEmail)
//                 .find();
//         })
//         .then((results) => {
//             if (results.items.length > 0) {
//                 let businessRecord = results.items[0];
//                 let businessId = businessRecord._id;

//                 return wixData.replaceReferences("Business", "categoriesMultiRef", businessId, selectedCategories)
//                     .then(() => {
//                         console.log("Categories saved successfully");
//                         return wixData.replaceReferences("Business", "subCategoriesMultiRef", businessId, selectedSubCategories);
//                     })
//                     .then(() => {
//                         console.log("Sub-categories saved successfully");

//                         return wixData.query("Categories")
//                             .hasSome("_id", selectedCategories)
//                             .find();
//                     })
//                     .then((categoryResults) => {
//                         const selectedCategoryTitles = categoryResults.items.map(item => item.title);

//                         return wixData.query("Sub-Categories")
//                             .hasSome("_id", selectedSubCategories)
//                             .find()
//                             .then((subCategoryResults) => {
//                                 const selectedSubCategoryTitles = subCategoryResults.items.map(item => item.title);

//                                 let toUpdate = {
//                                     _id: businessId,
//                                     categoriesTags: selectedCategoryTitles,
//                                     subCategoriesTags: selectedSubCategoryTitles
//                                 };

//                                 return wixData.update("Business", Object.assign({}, businessRecord, toUpdate));
//                             });
//                     })
//                     .then(() => {
//                         console.log("Tags saved successfully");
//                         $w("#message").text = "Saved Successfully!";
//                         $w("#message").html.fontcolor('#50C878');
//                         $w("#message").expand();
//                     })
//                     .catch((err) => {
//                         console.error("Error saving references or tags: ", err);
//                         $w("#message").text = "Save Failed!";
//                         $w("#message").html.fontcolor('#f22626');
//                         $w("#message").expand();
//                     });
//             } else {
//                 console.error("No Business record found for the current user.");
//                 $w("#message").text = "No Business record found.";
//                 $w("#message").html.fontcolor('#f22626');
//                 $w("#message").expand();
//             }
//         })
//         .catch((err) => {
//             console.error("Error querying the Business collection: ", err);
//             $w("#message").text = "Couldn't find Business Database.";
//             $w("#message").html.fontcolor('#f22626');
//             $w("#message").expand();
//         });
// }



import {viewImageWhenUpload} from 'public/utils'

$w.onReady(() => {
    $w('#repeater1').forEachItem(($item, itemData, index) => {
        $item('#uploadButton2').onChange(async() => {
            viewImageWhenUpload($item('#uploadButton2'), $item('#imageX126'), $item('#text621'))
            // console.log("onchange");
            // $item('#uploadButton2').uploadFiles()
            // .then((uploadedFiles) => {
            //     console.log(uploadedFiles);
            //     if (uploadedFiles.length > 0) {
            //         const fileUrl = uploadedFiles[0].fileUrl;
            //         $item('#imageX126').src = fileUrl;
            //         return fileUrl
            //     } else {
            //         console.error("No files were uploaded.");
            //         // showErrorMessage("No files were uploaded. Please select a file and try again.");
            //     }
            // })
            // .catch((uploadError) => {
            //     console.error("Error uploading image:", uploadError);
            //     // showErrorMessage("Error uploading image. Please try again.");
            // });
        })
    })
})