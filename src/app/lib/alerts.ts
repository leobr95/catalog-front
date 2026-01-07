import Swal from "sweetalert2";
import { ApiError } from "./api";

export function showError(title: string, err: unknown) {
  const messages =
    err instanceof ApiError
      ? err.messages
      : err instanceof Error
      ? [String(err.message)]
      : ["Error desconocido"];

  Swal.fire({
    icon: "error",
    title,
    html: `<div style="text-align:left">${messages.map((m) => `• ${escapeHtml(m)}`).join("<br/>")}</div>`,
  });
}

export function toastSuccess(text: string) {
  Swal.fire({
    toast: true,
    position: "top-end",
    timer: 1800,
    showConfirmButton: false,
    icon: "success",
    title: text,
  });
}

export async function confirmDelete(title: string, text: string): Promise<boolean> {
  const r = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });
  return Boolean(r.isConfirmed);
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
