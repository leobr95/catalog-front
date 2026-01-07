"use client";

import React from "react";
import Swal from "sweetalert2";
import { Modal, Upload, Button, Space, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

import { useAppDispatch } from "@/app/store/hooks";
import { bulkImportProductos } from "@/app/store/slices/productosSlice";
import { toastSuccess } from "@/app/lib/alerts";
import type { BulkImportResultDto } from "@/app/types/api";

type Lang = "es" | "en";

type Props = {
  open: boolean;
  onClose: () => void;
  lang?: Lang;
};

type ImportErrorItem = { row: number; message: string };

const MESSAGES: Record<Lang, Record<string, string>> = {
  es: {
    title: "Carga masiva (CSV/XLSX)",
    endpointLabel: "Endpoint",
    endpointHint: "multipart/form-data, campo",
    pickFile: "Seleccionar archivo",
    cancel: "Cancelar",
    submit: "Subir e importar",
    importingOk: "Importación OK",
    importingWithErrors: "Importación con errores",
    inserted: "Insertados",
    updated: "Actualizados",
    failed: "Fallidos",
    hintCategory: "Pista: “Categoria not found” significa que el IdCategoria del CSV no existe en tu API.",
    close: "Cerrar",
  },
  en: {
    title: "Bulk import (CSV/XLSX)",
    endpointLabel: "Endpoint",
    endpointHint: "multipart/form-data, field",
    pickFile: "Select file",
    cancel: "Cancel",
    submit: "Upload & import",
    importingOk: "Import OK",
    importingWithErrors: "Import completed with errors",
    inserted: "Inserted",
    updated: "Updated",
    failed: "Failed",
    hintCategory: "Hint: “Categoria not found” means the CSV IdCategoria does not exist in your API.",
    close: "Close",
  },
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isImportErrorItem(v: unknown): v is ImportErrorItem {
  if (!isRecord(v)) return false;
  return typeof v.row === "number" && typeof v.message === "string";
}

function normalizeErrors(errors: unknown): ImportErrorItem[] {
  if (!Array.isArray(errors)) return [];

  return errors.map((item, idx) => {
    if (isImportErrorItem(item)) return item;

    if (typeof item === "string") return { row: idx + 2, message: item };

    if (isRecord(item)) {
      const row = typeof item.row === "number" ? item.row : idx + 2;
      const msg =
        typeof item.message === "string"
          ? item.message
          : typeof item.error === "string"
          ? item.error
          : "Unknown error";
      return { row, message: msg };
    }

    return { row: idx + 2, message: "Unknown error" };
  });
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function BulkImportModal({ open, onClose, lang = "es" }: Props) {
  const t = MESSAGES[lang] ?? MESSAGES.es;

  const dispatch = useAppDispatch();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const [loading, setLoading] = React.useState(false);

  return (
    <Modal open={open} onCancel={onClose} footer={null} title={t.title} destroyOnClose>
      <Typography.Paragraph type="secondary">
        {t.endpointLabel}: <code>POST /api/productos/masivo</code> ({t.endpointHint} <code>file</code>)
      </Typography.Paragraph>

      <Upload
        fileList={fileList}
        beforeUpload={() => false}
        onChange={({ fileList: next }) => setFileList(next.slice(-1))}
        accept=".csv,.xlsx"
      >
        <Button icon={<UploadOutlined />}>{t.pickFile}</Button>
      </Upload>

      <div style={{ height: 16 }} />

      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button onClick={onClose}>{t.cancel}</Button>

        <Button
          type="primary"
          loading={loading}
          disabled={fileList.length === 0}
          onClick={async () => {
            try {
              const f = fileList[0]?.originFileObj;
              if (!(f instanceof File)) return;

              setLoading(true);

              const result = (await dispatch(bulkImportProductos({ file: f })).unwrap()) as BulkImportResultDto;

              const inserted = typeof result.inserted === "number" ? result.inserted : 0;
              const updated = typeof result.updated === "number" ? result.updated : 0;
              const failed = typeof result.failed === "number" ? result.failed : 0;

              const errors = normalizeErrors((result as unknown as { errors?: unknown }).errors);

              if (failed > 0 || errors.length > 0) {
                const max = 15;
                const list = errors
                  .slice(0, max)
                  .map((e) => `• Fila ${e.row}: ${escapeHtml(e.message)}`)
                  .join("<br/>");

                const more = errors.length > max ? `<br/><br/><em>+${errors.length - max} más…</em>` : "";

                await Swal.fire({
                  icon: "warning",
                  title: t.importingWithErrors,
                  html: `
                    <div style="text-align:left">
                      <div><b>${t.inserted}:</b> ${inserted} • <b>${t.updated}:</b> ${updated} • <b>${t.failed}:</b> ${failed}</div>
                      <br/>
                      <div>${list}${more}</div>
                      <br/>
                      <div style="opacity:.85">${escapeHtml(t.hintCategory)}</div>
                    </div>
                  `,
                  confirmButtonText: t.close,
                });

                return;
              }

              toastSuccess(`${t.importingOk} • ${t.inserted}: ${inserted} • ${t.updated}: ${updated} • ${t.failed}: ${failed}`);
              onClose();
            } catch (e) {
              await Swal.fire({
                icon: "error",
                title: "Error",
                text: e instanceof Error ? e.message : "Error desconocido",
              });
            } finally {
              setLoading(false);
            }
          }}
        >
          {t.submit}
        </Button>
      </Space>
    </Modal>
  );
}
