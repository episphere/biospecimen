/*
Sets the list item on the navbar to active and changes the background color
*/
export const activeReceiptsNavbar = () => {
  if (location.hash === "#packagesintransit") {
    const packagesInTransitNavItem = document.getElementById("packagesInTransitNavItem");
    packagesInTransitNavItem.classList.add("active");
    packagesInTransitNavItem.style.backgroundColor = "#bbcffc85";
    packagesInTransitNavItem.style.borderRadius = "4px 4px 0 0";
  } else if (location.hash === "#packagereceipt") {
    const packageReceiptNavItem = document.getElementById("packageReceiptNavItem");
    packageReceiptNavItem.classList.add("active");
    packageReceiptNavItem.style.backgroundColor = "#bbcffc85";
    packageReceiptNavItem.style.borderRadius = "4px 4px 0 0";
  } else if (location.hash === "#csvfilereceipt") {
    const csvFileReceiptNavItem = document.getElementById("csvFileReceiptNavItem");
    csvFileReceiptNavItem.classList.add("active");
    csvFileReceiptNavItem.style.backgroundColor = "#bbcffc85";
    csvFileReceiptNavItem.style.borderRadius = "4px 4px 0 0";
  } else return;
};       