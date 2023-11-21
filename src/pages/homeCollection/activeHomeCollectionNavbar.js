export const activeHomeCollectionNavbar = () => {
  const kitAssemblyNavItem = document.getElementById("kitAssembly")
  const participantSelectionNavItem = document.getElementById("participantSelection")
  const kitShipmentNavItem = document.getElementById("kitShipment")
  const printLabelsNavItem = document.getElementById("printLabels")
  const assignKitsNavItem = document.getElementById("assignKits")
  const kitsReceiptNavItem = document.getElementById("kitsReceipt")

  if (location.hash === "#kitassembly") {
      kitAssemblyNavItem.classList.add("active");
      kitAssemblyNavItem.style.backgroundColor = "#bbcffc85";
      kitAssemblyNavItem.style.borderRadius = "4px 4px 0 0";
  }
  else if (location.hash === "#printlabels") {
    printLabelsNavItem.classList.add("active");
    printLabelsNavItem.style.backgroundColor = "#bbcffc85";
    printLabelsNavItem.style.borderRadius = "4px 4px 0 0";
  }
  else if (location.hash === "#assignkits") {
    assignKitsNavItem.classList.add("active");
    assignKitsNavItem.style.backgroundColor = "#bbcffc85";
    assignKitsNavItem.style.borderRadius = "4px 4px 0 0";
  }
  else if (location.hash === "#kitshipment"){
    kitShipmentNavItem.classList.add("active");
    kitShipmentNavItem.style.backgroundColor = "#bbcffc85";
    kitShipmentNavItem.style.borderRadius = "4px 4px 0 0";
  }
  else if (location.hash === "#kitsreceipt"){
    kitsReceiptNavItem.classList.add("active");
    kitsReceiptNavItem.style.backgroundColor = "#bbcffc85";
    kitsReceiptNavItem.style.borderRadius = "4px 4px 0 0";
  }
  else if (location.hash === "#participantselection" || 
           location.hash === "#allParticipants" || 
           location.hash === "#addressPrinted" || 
           location.hash === "#assigned" ||
           location.hash === "#shipped" ||
           location.hash === "#received") {
      participantSelectionNavItem.classList.add("active");
      participantSelectionNavItem.style.backgroundColor = "#bbcffc85";
      participantSelectionNavItem.style.borderRadius = "4px 4px 0 0";
  }
  else return;
  };


