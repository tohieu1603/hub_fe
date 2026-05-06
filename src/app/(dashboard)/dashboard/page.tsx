"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { HubApp, Capability } from "@/types";
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Spin,
  Alert,
  List,
  Typography,
  Space,
} from "antd";
import {
  CloudServerOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface ActivityItem {
  type?: string;
  details?: string;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const { machine } = useAuth();
  const [apps, setApps] = useState<HubApp[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [hubOffline, setHubOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statusRes, appsRes, capsRes, actRes] = await Promise.all([
          api.hub.status(),
          api.hub.apps(),
          api.hub.capabilities(),
          api.hub.activity(),
        ]);
        if ((statusRes as { status?: string }).status === "offline") {
          setHubOffline(true);
        }
        setApps(appsRes.data ?? []);
        setCapabilities(capsRes.data ?? []);
        setActivity((actRes.data ?? []) as ActivityItem[]);
      } catch {
        setHubOffline(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <Title level={3} style={{ marginBottom: 24 }}>Dashboard</Title>

      {hubOffline && (
        <Alert
          type="warning"
          showIcon
          message="Hub is offline. Some data may be unavailable."
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Machine"
              value={machine?.name || "(none)"}
              prefix={<CloudServerOutlined style={{ color: "#2563eb" }} />}
            />
            {machine && (
              <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
                <Tag color={machine.status === "active" ? "success" : "default"}>
                  {machine.status}
                </Tag>
                <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                  {machine.hub_url}
                </Text>
              </Space>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Apps connected"
              value={apps.length}
              prefix={<AppstoreOutlined style={{ color: "#10b981" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Skills đã đăng ký với Hub
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Capabilities"
              value={capabilities.length}
              prefix={<ThunderboltOutlined style={{ color: "#f59e0b" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tổng số skill có thể gọi
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card title={<><HistoryOutlined /> Recent activity</>} size="small">
            {activity.length === 0 ? (
              <Text type="secondary">Chưa có hoạt động nào</Text>
            ) : (
              <List
                size="small"
                dataSource={activity.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item style={{ padding: "4px 0" }}>
                    <Text style={{ fontSize: 12 }}>
                      <Tag color="blue" style={{ marginRight: 4 }}>{item.type || "event"}</Tag>
                      {item.details ? String(item.details).slice(0, 40) : ""}
                    </Text>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
