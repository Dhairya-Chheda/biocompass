export const DOMAIN_URL = 'https://biocompass.io'

///// USER TYPE CONSTANTS /////

export const BUSINESS = 'business'
export const USER = 'user' 

///// PLANS IDS /////

export const BASIC_PLAN = "694897f8-2684-4c1b-8463-7dc9e40f99dc"
export const ESSENTIALS_PLAN = "bf590f8c-7405-482d-9d5c-b1ec747ee46e"
export const PRO_PLAN = "fc64e464-aaf6-4cd8-a9b1-65be4fb99604"
export const PREMIUM_PLAN = "c891f5bb-6320-4032-90bc-8786c7285e9a"

///// USER ROLE ASSIGNING ID /////

export const USER_ROLE = '1fd89d97-4d20-47a2-b6fa-dfef08352c92'
export const BUSINESS_ROLE = 'a6a6d1fe-bf73-49f1-aeb6-8887eedd0f97'

///// URL CONSTANTS /////

// GENERAL URL BEGIN //

export const HOME = "/"
export const REGISTER = "/login"
export const BUSINESS_REGISTER = "/login?userType=business"
export const PRICING_PLANS_PAGE = "/plans"

// GENERAL URL END //

// USER URL BEGIN //

export const USER_PROFILE_URL = '/user-dashboard?page=PROFILE'
export const USER_DASHBOARD_URL = '/user-dashboard?page=HOME'

// USER URL END //

// BUSINESS URL BEGIN //

export const BUSINESS_PROFILE_URL = '/business-dashboard?page=PROFILE'
export const BUSINESS_DASHBOARD_URL = '/business-dashboard?page=HOME'
export const BUSINESS_PRODUCTS_URL = '/business-dashboard?page=PRODUCTS'
export const BUSINESS_CENTERS_URL = '/business-dashboard?page=CENTERS'
export const BUSINESS_ADD_PRODUCT_URL = '/business-dashboard?page=ADDOREDITPRODUCT'
export const BUSINESS_ADD_CENTER_URL = '/business-dashboard?page=ADDOREDITCENTER'
export const BUSINESS_BILLING_URL = '/business-dashboard?page=BILLING'
export const BUSINESS_LISTINGS_URL = '/business-dashboard?page=LISTINGS'
export const BUSINESS_MEDIAHUB_URL = '/business-dashboard?page=MEDIAHUB'

// BUSINESS URL END //

///// DATABASE CONSTANTS /////

export const USER_DATABASE = 'User'
export const BUSINESS_DATABASE = 'Business'
export const CATEGORIES_DATABASE = 'Categories'
export const SUB_CATEGORIES_DATABASE = 'Sub-Categories'
export const CUSTOMER_FAVOURITE_DATABASE = 'CustomerFavourite'
export const CENTERS_DATABASE = 'Centers'
export const PRODUCT_DATABASE = 'Product'
export const PRICING_PLAN_DATABASE = 'PaidPlans/Plans'
export const HEALTH_GOALS_DATABASE = 'HealthGoals'

///// BUSINESS DASHBOARD MULTISTATE BOC IDS /////

export const BUSINESS_DAHBOARD_STATE_HOME = 'HOME'
export const BUSINESS_DAHBOARD_STATE_LISTINGS = 'LISTINGS'
export const BUSINESS_DAHBOARD_STATE_MEDIAHUB = 'MEDIAHUB'
export const BUSINESS_DAHBOARD_STATE_PROFILE = 'PROFILE'
export const BUSINESS_DAHBOARD_STATE_BILLING = 'BILLING'
export const BUSINESS_DAHBOARD_STATE_CENTERS = 'CENTERS'
export const BUSINESS_DAHBOARD_STATE_ADDOREDITCENTER = 'ADDOREDITCENTER'
export const BUSINESS_DAHBOARD_STATE_PRODUCTS = 'PRODUCTS'
export const BUSINESS_DAHBOARD_STATE_ADDOREDITPRODUCT = 'ADDOREDITPRODUCT'


///// MEDIA CONSTANTS /////
export const DEFAULT_PROFILE_PICTURE = ''
export const FAVOURITE_ICON = 'https://static.wixstatic.com/shapes/d46ff4_76c0363005da45f59797c68834b01207.svg'
export const FAVOURITE_FILL_ICON = 'https://static.wixstatic.com/shapes/d46ff4_72c98f98120b48a0b1963ad756606ccb.svg'
export const DEFAULT_ADD_PRODUCT_IMAGE = 'https://static.wixstatic.com/media/271756_61a0815c519340cca2c9915b885b77dc~mv2.png'
export const DEFAULT_ADD_PRODUCT_VIDEO = 'https://video.wixstatic.com/video/7ebb6f_276cc584caeb4b419763b88b1bdebb3d/1080p/mp4/file.mp4'