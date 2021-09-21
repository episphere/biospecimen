/*
Sets the list item on the navbar to active and changes the background color
*/

export const activeKitReportsNavbar = () => {
  const kitReportsNavItem = document.getElementById("kitReports");
  if (location.hash === "#kitreports") {
    console.log(kitReportsNavItem);
    kitReportsNavItem.classList.add("active");
    kitReportsNavItem.style.backgroundColor = "#bbcffc85";
    kitReportsNavItem.style.borderRadius = "4px 4px 0 0";
  } else return;
};
