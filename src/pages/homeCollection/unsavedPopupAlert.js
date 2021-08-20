// export const unsavedPopAlert = (submitStatus) => {
//   // let formSubmitting = false;
//   // const setFormSubmitting = function () {
//   //   formSubmitting = true;
//   // };

//   window.onload = function () {
//     window.addEventListener("beforeunload", function (e) {
//       if (formSubmitting) {
//         return undefined;
//       }

//       const confirmationMessage =
//         "It looks like you have been editing something. " +
//         "If you leave before saving, your changes will be lost.";

//       (e || window.event).returnValue = confirmationMessage; //Gecko + IE
//       return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
//     });
//   };
// };
