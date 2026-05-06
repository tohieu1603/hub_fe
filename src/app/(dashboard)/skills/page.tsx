"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Capability } from "@/types";
import {
  Card,
  Tag,
  Spin,
  Alert,
  Empty,
  Typography,
  Row,
  Col,
  Modal,
  Input,
  Button,
  message,
} from "antd";
import { ThunderboltOutlined, PlayCircleOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function SkillsPage() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Capability | null>(null);
  const [input, setInput] = useState("{}");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [msg, msgCtx] = message.useMessage();

  useEffect(() => {
    api.hub
      .capabilities()
      .then((res) => setCapabilities(res.data ?? []))
      .catch(() => setError("Failed to load skills"))
      .finally(() => setLoading(false));
  }, []);

  const onExecute = async () => {
    if (!selected) return;
    let parsed: any;
    try {
      parsed = JSON.parse(input);
    } catch {
      msg.error("Invalid JSON");
      return;
    }
    setRunning(true);
    try {
      const r = await api.hub.execute({
        app_id: selected.app_id,
        capability_id: selected.capability_id,
        input: parsed,
      });
      setResult(r);
    } catch (e: any) {
      msg.error(e.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" showIcon message={error} style={{ margin: 24 }} />;
  }

  const grouped = capabilities.reduce<Record<string, Capability[]>>((acc, cap) => {
    const key = cap.app_name ?? "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(cap);
    return acc;
  }, {});

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      {msgCtx}
      <Title level={3} style={{ marginBottom: 24 }}>
        <ThunderboltOutlined /> Skills ({capabilities.length})
      </Title>

      {Object.entries(grouped).map(([appName, caps]) => (
        <div key={appName} style={{ marginBottom: 24 }}>
          <Title level={5} style={{ color: "#475569", marginBottom: 12 }}>
            {appName}
          </Title>
          <Row gutter={[12, 12]}>
            {caps.map((cap) => (
              <Col key={cap.capability_id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  hoverable
                  size="small"
                  onClick={() => {
                    setSelected(cap);
                    setInput("{}");
                    setResult(null);
                  }}
                  styles={{ body: { padding: 16 } }}
                >
                  <Text strong>{cap.name}</Text>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: 12, margin: "4px 0 8px" }}>
                    {cap.description}
                  </Paragraph>
                  <div>
                    <Tag>{cap.category}</Tag>
                    {cap.is_async && <Tag color="blue">async</Tag>}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}

      {capabilities.length === 0 && <Empty description="Chưa có skills nào" />}

      <Modal
        title={selected?.name}
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={720}
      >
        {selected && (
          <>
            <Paragraph type="secondary">{selected.description}</Paragraph>
            <Tag>{selected.app_name}</Tag>
            <Tag color="blue">{selected.capability_id}</Tag>
            {selected.is_async && <Tag color="purple">async</Tag>}
            <div style={{ marginTop: 16 }}>
              <Text strong>Input (JSON):</Text>
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                style={{ fontFamily: "monospace", marginTop: 4 }}
              />
            </div>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={onExecute}
              loading={running}
              block
              style={{ marginTop: 12 }}
            >
              Execute
            </Button>
            {result && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Result:</Text>
                <pre
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: 12,
                    borderRadius: 4,
                    fontSize: 12,
                    overflow: "auto",
                    maxHeight: 300,
                    marginTop: 4,
                  }}
                >
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
