"use client";

import React from "react";
import { Modal, Spin } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  mdUrl: string;
};

export default function DocsModal({ open, onClose, title, mdUrl }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [md, setMd] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(mdUrl, { cache: "no-store" });
        const txt = await res.text();
        setMd(txt);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open, mdUrl]);

  return (
    <Modal open={open} onCancel={onClose} footer={null} title={title} width={980}>
      {loading ? (
        <div style={{ display: "grid", placeItems: "center", padding: 28 }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="md">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </div>
      )}
    </Modal>
  );
}
