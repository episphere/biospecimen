/*
Sets the list item on the navbar to active and changes the background color
*/

export const activeReceiptsNavbar = () => {
    const packagesInTransitNavItem = document.getElementById(
        "packagesInTransitNavItem"
    );
    const packageReceiptNavItem = document.getElementById(
        "packageReceiptNavItem"
    );
    if (location.hash === "#packagesintransit") {
        // console.log(packagesInTransitNavItem);
        packagesInTransitNavItem.classList.add("active");
        packagesInTransitNavItem.style.backgroundColor = "#bbcffc85";
        packagesInTransitNavItem.style.borderRadius = "4px 4px 0 0";
    } else if (location.hash === "#packagereceipt") {
        // console.log(packageReceiptNavItem);
        packageReceiptNavItem.classList.add("active");
        packageReceiptNavItem.style.backgroundColor = "#bbcffc85";
        packageReceiptNavItem.style.borderRadius = "4px 4px 0 0";
    } else return;
};
