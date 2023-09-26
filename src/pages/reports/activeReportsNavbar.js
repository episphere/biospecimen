/*
Sets the list item on the navbar to active and changes the background color
*/

export const activeReportsNavbar = () => {
    if (location.hash === "#kitreports") {
        const reportsNavItem = document.getElementById("kitsReportsNavItem");
        reportsNavItem.classList.add("active");
        reportsNavItem.style.backgroundColor = "#bbcffc85";
        reportsNavItem.style.borderRadius = "4px 4px 0 0";
    }
    else if (location.hash === "#collectionidsearch") {
        const reportsNavItem = document.getElementById("collectionSearchReportsNavItem");
        reportsNavItem.classList.add("active");
        reportsNavItem.style.backgroundColor = "#bbcffc85";
        reportsNavItem.style.borderRadius = "4px 4px 0 0";
    }
    else if (location.hash === "#bptlshipreports") {
        const reportsNavItem = document.getElementById("bptlShippingReportsNavItem");
        reportsNavItem.classList.add("active");
        reportsNavItem.style.backgroundColor = "#bbcffc85";
        reportsNavItem.style.borderRadius = "4px 4px 0 0";
    }
};
