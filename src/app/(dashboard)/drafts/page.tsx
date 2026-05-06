"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Card,
  Input,
  Button,
  Space,
  Tag,
  List,
  Empty,
  message,
  Spin,
  Typography,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface DraftListItem {
  id: string;
  topic: string;
  title: string;
  mode: string;
  status: string;
  cms_url?: string;
  blocks_count: number;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "default",
  applying: "processing",
  applied: "success",
  failed: "error",
};

export default function DraftsListPage() {
  const router = useRouter();
  const [items, setItems] = useState<DraftListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("");
  const [creating, setCreating] = useState(false);
  const [msg, msgCtx] = message.useMessage();

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.drafts.list({ limit: 50 });
      setItems(r.data?.items || []);
    } catch (e: any) {
      msg.error(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    if (!topic.trim()) {
      msg.warning("Hãy nhập topic trước");
      return;
    }
    setCreating(true);
    try {
      const r = await api.drafts.create({ topic: topic.trim() });
      msg.success("Draft created");
      router.push(`/drafts/${r.data.id}`);
    } catch (e: any) {
      msg.error(e.message || "Failed to create");
      setCreating(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await api.drafts.delete(id);
      msg.success("Đã xoá");
      load();
    } catch (e: any) {
      msg.error(e.message);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {msgCtx}

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2} style={{ color: "#f1f5f9", margin: 0 }}>
            <FileTextOutlined /> Content Drafts
          </Title>
          <Text type="secondary">
            Viết bài → preview → edit chi tiết từng block → click Apply để publish + cross-post + render video
          </Text>
        </div>

        <Card
          title="Tạo draft mới"
          extra={
            <Tooltip title="Refresh list">
              <Button type="text" icon={<ReloadOutlined />} onClick={load} />
            </Tooltip>
          }
        >
          <Space.Compact style={{ width: "100%" }}>
            <Input
              size="large"
              placeholder="Topic, ví dụ: Claude Opus 4.7, GPT-5.5 vs Llama 4..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onPressEnter={onCreate}
              disabled={creating}
            />
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={onCreate}
              loading={creating}
            >
              {creating ? "Đang viết... (~1-2 phút)" : "Tạo draft"}
            </Button>
          </Space.Compact>
          {creating && (
            <Text type="warning" style={{ display: "block", marginTop: 8, fontSize: 12 }}>
              Claude đang viết bài. Trang sẽ tự chuyển khi xong.
            </Text>
          )}
        </Card>

        <Card title={`Danh sách drafts (${items.length})`} bodyStyle={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <Spin size="large" />
            </div>
          ) : items.length === 0 ? (
            <Empty
              description="Chưa có draft nào"
              style={{ padding: 40 }}
            />
          ) : (
            <List
              dataSource={items}
              renderItem={(d) => (
                <List.Item
                  style={{ padding: "16px 24px", borderBottom: "1px solid #334155" }}
                  actions={[
                    d.cms_url ? (
                      <Tooltip title="Open published article">
                        <Button
                          type="link"
                          icon={<LinkOutlined />}
                          href={d.cms_url}
                          target="_blank"
                        >
                          Live
                        </Button>
                      </Tooltip>
                    ) : null,
                    <Button
                      type="primary"
                      ghost
                      icon={<EditOutlined />}
                      onClick={() => router.push(`/drafts/${d.id}`)}
                    >
                      Edit
                    </Button>,
                    <Popconfirm
                      title="Xoá draft này?"
                      onConfirm={() => onDelete(d.id)}
                      okText="Xoá"
                      cancelText="Huỷ"
                      okButtonProps={{ danger: true }}
                    >
                      <Button danger type="text" icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ].filter(Boolean) as any[]}
                >
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <a
                          onClick={() => router.push(`/drafts/${d.id}`)}
                          style={{ color: "#f1f5f9", fontWeight: 500 }}
                        >
                          {d.title || d.topic}
                        </a>
                        <Tag color={STATUS_COLORS[d.status] || "default"}>{d.status}</Tag>
                        <Tag>{d.mode}</Tag>
                      </Space>
                    }
                    description={
                      <Space size="middle" wrap>
                        <Text type="secondary">Topic: {d.topic}</Text>
                        <Text type="secondary">{d.blocks_count} blocks</Text>
                        <Text type="secondary">
                          {new Date(d.created_at).toLocaleString("vi-VN")}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Space>
    </div>
  );
}
