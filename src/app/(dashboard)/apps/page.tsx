"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HubApp } from "@/types";
import {
  Card,
  Tag,
  Spin,
  Alert,
  Empty,
  Typography,
  Row,
  Col,
  Collapse,
  List,
} from "antd";
import { AppstoreOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

function statusColor(status: string) {
  switch (status) {
    case "active":
    case "online":
      return "success";
    case "degraded":
      return "warning";
    default:
      return "error";
  }
}

export default function AppsPage() {
  const [apps, setApps] = useState<HubApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.hub
      .apps()
      .then((res) => setApps(res.data ?? []))
      .catch(() => setError("Failed to load apps"))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <AppstoreOutlined /> Apps connected ({apps.length})
      </Title>

      {apps.length === 0 ? (
        <Empty description="Chưa có app nào đăng ký" />
      ) : (
        <Row gutter={[16, 16]}>
          {apps.map((app) => (
            <Col key={app.app_id} xs={24} md={12} xl={8}>
              <Card
                title={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Text strong>{app.name}</Text>
                      <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                        v{app.version}
                      </Text>
                    </div>
                    <Tag color={statusColor(app.status)}>{app.status}</Tag>
                  </div>
                }
              >
                <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: 13 }}>
                  {app.description}
                </Paragraph>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {app.capabilities?.length ?? 0} capabilities
                </Text>
                {app.capabilities && app.capabilities.length > 0 && (
                  <Collapse
                    ghost
                    size="small"
                    style={{ marginTop: 8 }}
                    items={[
                      {
                        key: "caps",
                        label: <Text type="secondary" style={{ fontSize: 12 }}>Xem capabilities</Text>,
                        children: (
                          <List
                            size="small"
                            dataSource={app.capabilities}
                            renderItem={(cap) => (
                              <List.Item style={{ padding: "4px 0" }}>
                                <Text style={{ fontSize: 12 }}>{cap.name}</Text>
                                <Tag style={{ marginLeft: "auto" }}>{cap.category}</Tag>
                              </List.Item>
                            )}
                          />
                        ),
                      },
                    ]}
                  />
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
