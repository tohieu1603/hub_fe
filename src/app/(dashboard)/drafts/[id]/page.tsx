"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Card,
  Button,
  Input,
  Space,
  Tabs,
  Tag,
  Spin,
  message,
  Modal,
  Typography,
  Form,
  InputNumber,
  Select,
  Alert,
  Row,
  Col,
  Tooltip,
  Progress,
  Result,
  Image,
  Divider,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
  FacebookOutlined,
  TwitterOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  LinkOutlined,
  EyeOutlined,
  PictureOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { BlockBody, BLOCK_TYPES, newBlock, type ContentBlock } from "@/components/draft/block-body";
import { BlockStyleEditor, type BlockStyle } from "@/components/draft/block-style-editor";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const STATUS_TAG: Record<string, { color: string; text: string }> = {
  draft: { color: "default", text: "Draft" },
  applying: { color: "processing", text: "Đang apply..." },
  applied: { color: "success", text: "Đã đăng" },
  failed: { color: "error", text: "Failed" },
};

export default function DraftDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [msg, msgCtx] = message.useMessage();
  const [confirmApply, setConfirmApply] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.drafts.get(params.id);
      setDraft(r.data);
    } catch (e: any) {
      msg.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  // Poll status when applying
  useEffect(() => {
    if (draft?.status !== "applying") return;
    const interval = setInterval(async () => {
      const r = await api.drafts.status(draft.id);
      setDraft((d: any) => ({ ...d, ...r.data }));
      if (r.data.status === "applied" || r.data.status === "failed") {
        clearInterval(interval);
        load();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [draft?.status, draft?.id, load]);

  const updateField = (path: string, value: any) => {
    setDraft((d: any) => {
      const next = { ...d };
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateBlock = (i: number, patch: Partial<ContentBlock>) => {
    const blocks = [...(draft.article.contentBlocks || [])];
    blocks[i] = { ...blocks[i], ...patch };
    updateField("article.contentBlocks", blocks);
  };

  const updateBlockStyle = (i: number, style: BlockStyle) => {
    updateBlock(i, { style } as any);
  };

  const addBlock = (type: string, afterIndex: number) => {
    const blocks = [...(draft.article.contentBlocks || [])];
    blocks.splice(afterIndex + 1, 0, newBlock(type, afterIndex + 1));
    blocks.forEach((b: any, i: number) => (b.order = i));
    updateField("article.contentBlocks", blocks);
  };

  const removeBlock = (i: number) => {
    const blocks = [...(draft.article.contentBlocks || [])];
    blocks.splice(i, 1);
    blocks.forEach((b: any, idx: number) => (b.order = idx));
    updateField("article.contentBlocks", blocks);
  };

  const moveBlock = (i: number, dir: -1 | 1) => {
    const blocks = [...(draft.article.contentBlocks || [])];
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    blocks.forEach((b: any, idx: number) => (b.order = idx));
    updateField("article.contentBlocks", blocks);
  };

  const duplicateBlock = (i: number) => {
    const blocks = [...(draft.article.contentBlocks || [])];
    const copy = JSON.parse(JSON.stringify(blocks[i]));
    copy.id = String(Date.now()) + Math.random().toString(36).slice(2, 6);
    blocks.splice(i + 1, 0, copy);
    blocks.forEach((b: any, idx: number) => (b.order = idx));
    updateField("article.contentBlocks", blocks);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await api.drafts.update(draft.id, {
        article: draft.article,
        fb_text: draft.fb_text,
        x_text: draft.x_text,
        cover_path: draft.cover_path,
        video_hook: draft.video?.hook,
        video_subtitle: draft.video?.subtitle,
        video_pros: draft.video?.pros,
        video_cons: draft.video?.cons,
        video_score: draft.video?.score,
      });
      msg.success("Đã lưu draft");
    } catch (e: any) {
      msg.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onApply = async () => {
    setConfirmApply(false);
    setApplying(true);
    try {
      await onSave();
      await api.drafts.apply(draft.id);
      msg.info("Apply started — đang publish + cross-post + render video...");
      load();
    } catch (e: any) {
      msg.error(e.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}><Text type="secondary">Loading draft...</Text></div>
      </div>
    );
  }
  if (!draft) {
    return <Result status="404" title="Draft not found" extra={<Button onClick={() => router.push("/drafts")}>Quay lại</Button>} />;
  }

  const status = draft.status;
  const isLocked = status === "applying" || status === "applied";
  const statusInfo = STATUS_TAG[status] || STATUS_TAG.draft;
  const progressPercent = draft.apply_progress
    ? Math.round((draft.apply_progress.step / (draft.apply_progress.total || 5)) * 100)
    : 0;

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      {msgCtx}

      {/* HEADER */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col flex="auto">
            <Space size="large">
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.push("/drafts")} />
              <div>
                <Title level={4} style={{ margin: 0, color: "#0f172a" }}>
                  {draft.article.title || draft.topic}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Topic: {draft.topic} · {draft.article.contentBlocks?.length || 0} blocks · ID: {draft.id}
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tag color={statusInfo.color} style={{ fontSize: 13 }}>{statusInfo.text}</Tag>
              <Button icon={<SaveOutlined />} onClick={onSave} loading={saving} disabled={isLocked}>
                Save
              </Button>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => setConfirmApply(true)}
                loading={applying}
                disabled={isLocked}
              >
                Apply
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Apply progress */}
        {status === "applying" && draft.apply_progress && (
          <Alert
            type="warning"
            showIcon
            icon={<LoadingOutlined />}
            style={{ marginTop: 16 }}
            message={`Phase: ${draft.apply_progress.phase} (${draft.apply_progress.step}/${draft.apply_progress.total})`}
            description={<Progress percent={progressPercent} status="active" strokeColor="#10b981" />}
          />
        )}

        {/* Apply results */}
        {status === "applied" && (
          <Alert
            type="success"
            showIcon
            style={{ marginTop: 16 }}
            message="Đã apply thành công"
            description={
              <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
                <Col xs={24} md={12}><ResultLine label="CMS" value={draft.cms_url} link /></Col>
                <Col xs={24} md={12}><ResultLine label="Facebook" value={draft.fb_status} /></Col>
                <Col xs={24} md={12}><ResultLine label="X" value={draft.x_status} /></Col>
                <Col xs={24} md={12}><ResultLine label="Video" value={draft.video_path ? "rendered" : "—"} /></Col>
                <Col xs={24} md={12}><ResultLine label="TikTok" value={draft.tiktok_status} /></Col>
                <Col xs={24} md={12}><ResultLine label="FB Reel" value={draft.fb_reel_status} /></Col>
              </Row>
            }
          />
        )}

        {status === "failed" && (
          <Alert type="error" showIcon style={{ marginTop: 16 }} message="Apply failed" description={draft.apply_error} />
        )}
      </Card>

      {/* COVER IMAGE SWAP */}
      <CoverImageCard draft={draft} isLocked={isLocked} updateField={updateField} msg={msg} />

      {/* TABS */}
      <Tabs
        defaultActiveKey="article"
        type="card"
        items={[
          {
            key: "article",
            label: <span><FileTextOutlined /> Article ({draft.article.contentBlocks?.length || 0})</span>,
            children: (
              <ArticleTab
                draft={draft}
                isLocked={isLocked}
                updateField={updateField}
                updateBlock={updateBlock}
                updateBlockStyle={updateBlockStyle}
                addBlock={addBlock}
                removeBlock={removeBlock}
                moveBlock={moveBlock}
                duplicateBlock={duplicateBlock}
              />
            ),
          },
          {
            key: "fb",
            label: <span><FacebookOutlined /> Facebook</span>,
            children: <FacebookTab draft={draft} isLocked={isLocked} updateField={updateField} />,
          },
          {
            key: "x",
            label: <span><TwitterOutlined /> X</span>,
            children: <XTab draft={draft} isLocked={isLocked} updateField={updateField} />,
          },
          {
            key: "video",
            label: <span><VideoCameraOutlined /> Video</span>,
            children: <VideoTab draft={draft} isLocked={isLocked} updateField={updateField} />,
          },
        ]}
      />

      {/* APPLY MODAL */}
      <Modal
        title="Apply draft"
        open={confirmApply}
        onCancel={() => setConfirmApply(false)}
        onOk={onApply}
        okText="Apply ngay"
        cancelText="Huỷ"
        okButtonProps={{ type: "primary", icon: <ThunderboltOutlined /> }}
      >
        <Paragraph>Lệnh sẽ chạy nền (~5-10 phút):</Paragraph>
        <ul>
          <li>Publish bài lên <strong>post.operis.vn</strong></li>
          <li>Cross-post <strong>Facebook</strong> + <strong>X</strong></li>
          <li>Render video 60s tiếng Việt</li>
          <li>Upload <strong>TikTok</strong> + <strong>FB Reels</strong></li>
        </ul>
        <Alert type="warning" showIcon message="Sau khi apply, draft sẽ bị khóa." />
      </Modal>
    </div>
  );
}

// ============================================
// COVER IMAGE CARD
// ============================================
function CoverImageCard({ draft, isLocked, updateField, msg }: any) {
  const url = draft.cover_path;
  const [rendering, setRendering] = useState(false);

  const handleUrlChange = (e: any) => {
    updateField("cover_path", e.target.value);
  };

  const onRerender = async () => {
    setRendering(true);
    try {
      const desc = draft.article?.image_descriptions?.cover;
      const r = await api.drafts.renderCover(draft.id, desc);
      updateField("cover_path", r.data.cover_path);
      msg.success("Cover đã render xong");
    } catch (e: any) {
      msg.error(e.message || "Render failed");
    } finally {
      setRendering(false);
    }
  };

  return (
    <Card
      title={<Space><PictureOutlined /> Cover image (1200×630)</Space>}
      style={{ marginBottom: 16 }}
      extra={
        <Tooltip title="Re-render cover từ description bên dưới (qua video-creator skill)">
          <Button
            icon={<ReloadOutlined />}
            disabled={isLocked}
            loading={rendering}
            onClick={onRerender}
          >
            {rendering ? "Đang render..." : "Re-render"}
          </Button>
        </Tooltip>
      }
    >
      <Row gutter={16}>
        <Col xs={24} md={14}>
          <Form layout="vertical" disabled={isLocked}>
            <Form.Item label="Cover path / URL">
              <Input
                value={url || ""}
                onChange={handleUrlChange}
                placeholder="/Users/.../cover.png hoặc https://..."
                addonBefore={<PictureOutlined />}
              />
            </Form.Item>
            <Form.Item label="Description (cho AI re-render)">
              <TextArea
                value={draft.article?.image_descriptions?.cover || ""}
                onChange={(e) => updateField("article.image_descriptions", { ...(draft.article?.image_descriptions || {}), cover: e.target.value })}
                rows={2}
                placeholder="Mô tả hình cover infographic..."
              />
            </Form.Item>
          </Form>
        </Col>
        <Col xs={24} md={10}>
          <Text type="secondary" style={{ fontSize: 12 }}>Preview:</Text>
          <div style={{ marginTop: 8, background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 8, padding: 12, textAlign: "center" }}>
            {url ? (
              url.startsWith("http") || url.startsWith("/uploads/") ? (
                <Image src={url} alt="cover" style={{ maxWidth: "100%", borderRadius: 4 }} />
              ) : (
                <Space direction="vertical">
                  <PictureOutlined style={{ fontSize: 32, color: "#64748b" }} />
                  <Text type="secondary" style={{ fontSize: 11, wordBreak: "break-all" }}>
                    Local: {url.split("/").pop()}
                  </Text>
                </Space>
              )
            ) : (
              <Text type="secondary">No cover yet — bấm "Re-render" để tạo</Text>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
}

// ============================================
// ARTICLE TAB
// ============================================
function ArticleTab({ draft, isLocked, updateField, updateBlock, updateBlockStyle, addBlock, removeBlock, moveBlock, duplicateBlock }: any) {
  return (
    <>
      <Card title="Metadata" style={{ marginBottom: 16 }}>
        <Form layout="vertical" disabled={isLocked}>
          <Form.Item label="Title">
            <Input
              value={draft.article.title || ""}
              onChange={(e) => updateField("article.title", e.target.value)}
              size="large"
              showCount
              maxLength={120}
            />
          </Form.Item>
          <Form.Item label="Excerpt (lead)">
            <TextArea
              value={draft.article.excerpt || ""}
              onChange={(e) => updateField("article.excerpt", e.target.value)}
              rows={2}
              showCount
              maxLength={500}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Meta Title (SEO)" tooltip="50-60 ký tự, keyword đầu">
                <Input
                  value={draft.article.metaTitle || ""}
                  onChange={(e) => updateField("article.metaTitle", e.target.value)}
                  showCount
                  maxLength={70}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Category slug">
                <Input
                  value={draft.article.category || ""}
                  onChange={(e) => updateField("article.category", e.target.value)}
                  placeholder="ai-models"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Meta Description" tooltip="150-160 ký tự, lời mời đọc">
            <TextArea
              value={draft.article.metaDescription || ""}
              onChange={(e) => updateField("article.metaDescription", e.target.value)}
              rows={2}
              showCount
              maxLength={200}
            />
          </Form.Item>
          <Form.Item label="Tags (Enter để thêm)">
            <Select
              mode="tags"
              value={draft.article.tags || []}
              onChange={(v) => updateField("article.tags", v)}
              tokenSeparators={[",", "\n"]}
              style={{ width: "100%" }}
              placeholder="ai, claude, llm..."
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title={`Content Blocks (${draft.article.contentBlocks?.length || 0})`}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {(draft.article.contentBlocks || []).map((b: ContentBlock, i: number) => (
            <BlockEditorCard
              key={b.id}
              block={b}
              index={i}
              total={draft.article.contentBlocks.length}
              isLocked={isLocked}
              onChange={(patch) => updateBlock(i, patch)}
              onChangeStyle={(s) => updateBlockStyle(i, s)}
              onMove={(dir) => moveBlock(i, dir)}
              onRemove={() => removeBlock(i)}
              onDuplicate={() => duplicateBlock(i)}
              onAddAfter={(type) => addBlock(type, i)}
            />
          ))}

          {(!draft.article.contentBlocks || draft.article.contentBlocks.length === 0) && (
            <Button type="dashed" icon={<PlusOutlined />} onClick={() => addBlock("paragraph", -1)} disabled={isLocked} block size="large">
              Thêm block đầu tiên
            </Button>
          )}

          {draft.article.contentBlocks?.length > 0 && !isLocked && (
            <Select
              placeholder="+ Thêm block ở cuối"
              value={undefined}
              onChange={(v) => v && addBlock(v, (draft.article.contentBlocks?.length ?? 0) - 1)}
              options={BLOCK_TYPES.map((t) => ({ value: t.value, label: `+ ${t.label}` }))}
              style={{ width: "100%" }}
              size="large"
            />
          )}
        </Space>
      </Card>
    </>
  );
}

// ============================================
// BLOCK EDITOR CARD
// ============================================
function BlockEditorCard({
  block,
  index,
  total,
  isLocked,
  onChange,
  onChangeStyle,
  onMove,
  onRemove,
  onDuplicate,
  onAddAfter,
}: {
  block: ContentBlock;
  index: number;
  total: number;
  isLocked: boolean;
  onChange: (patch: Partial<ContentBlock>) => void;
  onChangeStyle: (style: BlockStyle) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onAddAfter: (type: string) => void;
}) {
  return (
    <Card
      size="small"
      type="inner"
      style={{ background: "#fafafa" }}
      title={
        <Space wrap>
          <Tag color="blue">#{index + 1}</Tag>
          <Select
            size="small"
            value={block.type}
            onChange={(v) => onChange({ type: v })}
            options={BLOCK_TYPES}
            disabled={isLocked}
            style={{ minWidth: 200 }}
          />
          {block.type === "heading" && (
            <Select
              size="small"
              value={block.level || 2}
              onChange={(v) => onChange({ level: v })}
              options={[1, 2, 3, 4, 5, 6].map((l) => ({ value: l, label: `h${l}` }))}
              disabled={isLocked}
              style={{ width: 80 }}
            />
          )}
        </Space>
      }
      extra={
        <Space size="small">
          <Tooltip title="Lên">
            <Button size="small" type="text" icon={<ArrowUpOutlined />} onClick={() => onMove(-1)} disabled={isLocked || index === 0} />
          </Tooltip>
          <Tooltip title="Xuống">
            <Button size="small" type="text" icon={<ArrowDownOutlined />} onClick={() => onMove(1)} disabled={isLocked || index === total - 1} />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button size="small" type="text" icon={<PlusOutlined />} onClick={onDuplicate} disabled={isLocked} />
          </Tooltip>
          <Select
            size="small"
            placeholder="+ Add after"
            value={undefined}
            onChange={(v) => v && onAddAfter(v)}
            options={BLOCK_TYPES.map((t) => ({ value: t.value, label: `+ ${t.label}` }))}
            disabled={isLocked}
            style={{ width: 180 }}
          />
          <Tooltip title="Xoá">
            <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={onRemove} disabled={isLocked} />
          </Tooltip>
        </Space>
      }
    >
      <BlockBody block={block} isLocked={isLocked} onChange={onChange} />
      <Divider style={{ margin: "12px 0" }} />
      <BlockStyleEditor value={(block as any).style} onChange={onChangeStyle} disabled={isLocked} />
    </Card>
  );
}

// ============================================
// FACEBOOK TAB
// ============================================
function FacebookTab({ draft, isLocked, updateField }: any) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card title={<><FacebookOutlined style={{ color: "#1877f2" }} /> Edit Facebook post</>}>
          <Alert
            type="info"
            showIcon
            message="Cover image tự attach. Placeholder <<URL_AFTER_PUBLISH>> sẽ được thay bằng URL CMS thật khi apply."
            style={{ marginBottom: 12 }}
          />
          <TextArea
            value={draft.fb_text || ""}
            onChange={(e) => updateField("fb_text", e.target.value)}
            disabled={isLocked}
            rows={20}
            style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 13 }}
            showCount
            maxLength={5000}
          />
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card title={<><EyeOutlined /> Live preview</>}>
          <FacebookPreview text={draft.fb_text || ""} cover={draft.cover_path} />
        </Card>
      </Col>
    </Row>
  );
}

function FacebookPreview({ text, cover }: { text: string; cover?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: 16, color: "#050505" }}>
      <Space>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1877f2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
          MA
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#050505" }}>MulApps</div>
          <div style={{ fontSize: 12, color: "#65676b" }}>vừa xong · 🌐</div>
        </div>
      </Space>
      <div style={{ whiteSpace: "pre-wrap", marginTop: 12, fontSize: 14, lineHeight: 1.5, color: "#050505" }}>
        {text || <span style={{ color: "#65676b" }}>(no text)</span>}
      </div>
      {cover && (
        <div style={{ marginTop: 12 }}>
          {(cover.startsWith("http") || cover.startsWith("/uploads/")) ? (
            <Image src={cover} alt="cover" style={{ maxWidth: "100%", borderRadius: 4 }} />
          ) : (
            <Text type="secondary" style={{ fontSize: 11, color: "#65676b" }}>📷 Cover: {cover.split("/").pop()}</Text>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// X TAB
// ============================================
function XTab({ draft, isLocked, updateField }: any) {
  const len = (draft.x_text || "").length;
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card title={<><TwitterOutlined /> Edit X post</>}>
          <Alert type="info" showIcon message="Tối đa 280 chars. URL được auto-link bởi X." style={{ marginBottom: 12 }} />
          <TextArea
            value={draft.x_text || ""}
            onChange={(e) => updateField("x_text", e.target.value)}
            disabled={isLocked}
            rows={6}
            maxLength={280}
            showCount
            style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 13 }}
          />
          <Progress
            percent={Math.min(100, (len / 280) * 100)}
            status={len > 280 ? "exception" : len > 250 ? "active" : "success"}
            showInfo={false}
            style={{ marginTop: 8 }}
          />
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card title={<><EyeOutlined /> Live preview</>}>
          <XPreview text={draft.x_text || ""} />
        </Card>
      </Col>
    </Row>
  );
}

function XPreview({ text }: { text: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 16, color: "#0f1419" }}>
      <Space>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
          MA
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>MulApps</div>
          <div style={{ fontSize: 13, color: "#536471" }}>@mulapps · vừa xong</div>
        </div>
      </Space>
      <div style={{ whiteSpace: "pre-wrap", marginTop: 12, fontSize: 15, lineHeight: 1.4 }}>
        {text || <span style={{ color: "#536471" }}>(no text)</span>}
      </div>
    </div>
  );
}

// ============================================
// VIDEO TAB
// ============================================
function VideoTab({ draft, isLocked, updateField }: any) {
  return (
    <Card title={<><VideoCameraOutlined /> Video plan (60s TikTok format · 1080×1920)</>}>
      <Alert
        type="warning"
        showIcon
        message="Voice tiếng Việt FPT giọng Bắc 'leminh' + auto humanize tiếng Anh."
        description="Video render khi click Apply. Edit dưới sẽ ảnh hưởng nội dung."
        style={{ marginBottom: 16 }}
      />
      <Form layout="vertical" disabled={isLocked}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Hook (max 45 chars)">
              <Input
                value={draft.video?.hook || ""}
                onChange={(e) => updateField("video.hook", e.target.value)}
                maxLength={45}
                showCount
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Subtitle (max 30 chars)">
              <Input
                value={draft.video?.subtitle || ""}
                onChange={(e) => updateField("video.subtitle", e.target.value)}
                maxLength={30}
                showCount
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={4}>
            <Form.Item label="Score (0-10)">
              <InputNumber
                value={draft.video?.score ?? 9}
                onChange={(v) => updateField("video.score", v)}
                min={0}
                max={10}
                step={0.1}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Pros (1 dòng / mục, tối đa 4)">
              <TextArea
                value={(draft.video?.pros || []).join("\n")}
                onChange={(e) => updateField("video.pros", e.target.value.split("\n").filter(Boolean))}
                rows={5}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Cons (1 dòng / mục, tối đa 2)">
              <TextArea
                value={(draft.video?.cons || []).join("\n")}
                onChange={(e) => updateField("video.cons", e.target.value.split("\n").filter(Boolean))}
                rows={5}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Stats (4 items hiển thị scene 2)</Divider>
        <Text type="secondary" style={{ fontSize: 12 }}>
          (Stats được render từ data Claude viết. Edit JSON nếu cần.)
        </Text>
        <pre style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 4, fontSize: 12, marginTop: 8, overflow: "auto", color: "#475569" }}>
          {JSON.stringify(draft.video?.stats || [], null, 2)}
        </pre>
      </Form>
    </Card>
  );
}

// ============================================
// HELPER
// ============================================
function ResultLine({ label, value, link }: { label: string; value?: string | null; link?: boolean }) {
  return (
    <Space>
      <Text type="secondary">{label}:</Text>
      {value ? (
        link && value.startsWith("http") ? (
          <a href={value} target="_blank" rel="noreferrer">
            <LinkOutlined /> {value}
          </a>
        ) : (
          <Text strong>
            <CheckCircleOutlined style={{ color: "#10b981", marginRight: 4 }} />
            {value}
          </Text>
        )
      ) : (
        <Text type="secondary">—</Text>
      )}
    </Space>
  );
}
