"use client";

import React from "react";
import { Modal, Form, Input, Switch, Button, Space } from "antd";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "@/app/store/hooks";
import { createCategoria, updateCategoria } from "@/app/store/slices/categoriasSlice";
import { toastSuccess, showError } from "@/app/lib/alerts";
import type { CategoriaDto, CategoriaCreateUpdateDto } from "@/app/types/api";

type Props = {
  open: boolean;
  onClose: () => void;
  initial: CategoriaDto | null;
};

export default function CategoriaFormModal({ open, onClose, initial }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<CategoriaCreateUpdateDto>();

  React.useEffect(() => {
    if (!open) return;

    form.resetFields();
    form.setFieldsValue({
      nombre: initial?.nombre ?? "",
      descripcion: initial?.descripcion ?? "",
      activo: initial?.activo ?? true,
    });
  }, [open, initial, form]);

  const isEdit = typeof initial?.idCategoria === "number";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={isEdit ? t("categories.editTitle") : t("categories.newTitle")}
      destroyOnClose
    >
      <Form<CategoriaCreateUpdateDto>
        form={form}
        layout="vertical"
        onFinish={async (v) => {
          try {
            if (isEdit && initial) {
              await dispatch(updateCategoria({ id: initial.idCategoria, dto: v })).unwrap();
              toastSuccess(t("categories.updatedOk"));
            } else {
              await dispatch(createCategoria({ dto: v })).unwrap();
              toastSuccess(t("categories.createdOk"));
            }
            onClose();
          } catch (e) {
            showError(t("errors.genericTitle"), e);
          }
        }}
      >
        <Form.Item
          name="nombre"
          label={t("common.name")}
          rules={[
            { required: true, message: t("auth.fullNameRequired") }, // o crea common.nameRequired si prefieres
            { min: 2, message: t("auth.minChars", { n: 2 }) },
          ]}
        >
          <Input placeholder="Ej: Dotación" />
        </Form.Item>

        <Form.Item name="descripcion" label={t("common.description")}>
          <Input.TextArea rows={3} placeholder={t("common.optional")} />
        </Form.Item>

        <Form.Item name="activo" label={t("common.active")} valuePropName="checked">
          <Switch />
        </Form.Item>

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="primary" htmlType="submit">
            {t("common.save")}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}
