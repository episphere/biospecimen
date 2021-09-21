/*
Sets the list item on the navbar to active and changes the background color
*/

export const activeReceiptsNavbar = () => {
  const packageInTransitNavItem = document.getElementById(
    "receiptNavItemPackagesInTransit"
  );
  const packageReceiptNavItem = document.getElementById("packageReceipt");
  if (location.hash === "#packagesintransit") {
    console.log(packageInTransitNavItem);
    packageInTransitNavItem.classList.add("active");
    packageInTransitNavItem.style.backgroundColor = "#bbcffc85";
    packageInTransitNavItem.style.borderRadius = "4px 4px 0 0";
  } else if (location.hash === "#receivepackages") {
    console.log(packageReceiptNavItem);
    packageReceiptNavItem.classList.add("active");
    packageReceiptNavItem.style.backgroundColor = "#bbcffc85";
    packageReceiptNavItem.style.borderRadius = "4px 4px 0 0";
  } else return;
};
