import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

let dialogOpen = false;

export async function confirmAction({ title, text, confirmButtonText }) {
  if (dialogOpen) return false;
  dialogOpen = true;
  try {
    const result = await Swal.fire({
      titleText: title,
      text,
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText,
      focusCancel: true,
      buttonsStyling: false,
      heightAuto: false,
      customClass: {
        popup: 'kbr-confirmation',
        confirmButton: 'ui-btn ui-btn-primary',
        cancelButton: 'ui-btn ui-btn-ghost',
        actions: 'kbr-confirmation-actions',
      },
      didOpen: popup => popup.setAttribute('data-theme', 'kbr'),
    });
    return result.isConfirmed;
  } finally {
    dialogOpen = false;
  }
}
