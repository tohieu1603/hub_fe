"use client";

/**
 * BlockBody — render input controls đặc thù cho từng block type.
 * Tách khỏi page chính để dễ maintain + thêm block types mới.
 */
import {
  Input,
  Select,
  Space,
  Typography,
  Image,
  Card,
  Button,
  ColorPicker,
  Slider,
  InputNumber,
  Row,
  Col,
  Form,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

export interface ContentBlock {
  id: string;
  type: string;
  order: number;
  content?: string;
  text?: string;
  level?: number;
  list?: { type: string; items: string[] };
  table?: { headers: string[]; rows: string[][] };
  image?: { url?: string; alt?: string; caption?: string; width?: number; height?: number; link?: string };
  faqs?: Array<{ question: string; answer: string }>;
  language?: string;
  callout?: { type?: string; title?: string; content?: string };
  stats?: { items: Array<{ value: string; label: string; icon?: string; color?: string }>; columns?: number };
  divider?: { style?: string; color?: string; width?: number };
  embed?: { url?: string; provider?: string; caption?: string };
  hero?: { title?: string; subtitle?: string; align?: string; height?: string; cta?: { text: string; url: string } };
  author?: string; // for quote
  anchor?: string; // for heading
  [key: string]: any;
}

export function BlockBody({
  block,
  isLocked,
  onChange,
}: {
  block: ContentBlock;
  isLocked: boolean;
  onChange: (p: Partial<ContentBlock>) => void;
}) {
  // ============== PARAGRAPH / QUOTE ==============
  if (block.type === "paragraph") {
    return (
      <TextArea
        value={block.content || ""}
        onChange={(e) => onChange({ content: e.target.value })}
        disabled={isLocked}
        rows={3}
        placeholder="Đoạn văn... (hỗ trợ **bold**, *italic*)"
      />
    );
  }

  if (block.type === "quote") {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <TextArea
          value={block.content || ""}
          onChange={(e) => onChange({ content: e.target.value })}
          disabled={isLocked}
          rows={3}
          placeholder="Trích dẫn..."
          style={{ fontStyle: "italic" }}
        />
        <Input
          value={block.author || ""}
          onChange={(e) => onChange({ author: e.target.value })}
          disabled={isLocked}
          placeholder="— Tác giả (tuỳ chọn)"
          addonBefore="Author"
        />
      </Space>
    );
  }

  // ============== HEADING ==============
  if (block.type === "heading") {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Input
          value={block.text || ""}
          onChange={(e) => onChange({ text: e.target.value })}
          disabled={isLocked}
          placeholder="Tiêu đề"
          style={{
            fontWeight: 700,
            fontSize: block.level === 1 ? 28 : block.level === 2 ? 22 : block.level === 3 ? 18 : 16,
          }}
        />
        <Input
          value={block.anchor || ""}
          onChange={(e) => onChange({ anchor: e.target.value })}
          disabled={isLocked}
          placeholder="anchor-id (cho TOC, tuỳ chọn)"
          addonBefore="#"
        />
      </Space>
    );
  }

  // ============== LIST ==============
  if (block.type === "list") {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Select
          value={block.list?.type || "unordered"}
          onChange={(v) => onChange({ list: { ...(block.list || { items: [] }), type: v } })}
          disabled={isLocked}
          options={[
            { value: "unordered", label: "Unordered (•)" },
            { value: "ordered", label: "Ordered (1.)" },
            { value: "checklist", label: "Checklist (☐)" },
          ]}
        />
        <TextArea
          value={(block.list?.items || []).join("\n")}
          onChange={(e) =>
            onChange({
              list: {
                ...(block.list || { type: "unordered" }),
                items: e.target.value.split("\n").filter(Boolean),
              },
            })
          }
          disabled={isLocked}
          rows={Math.max(3, (block.list?.items?.length || 1) + 1)}
          placeholder="1 mục / dòng"
        />
      </Space>
    );
  }

  // ============== CODE ==============
  if (block.type === "code") {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Select
          value={block.language || "javascript"}
          onChange={(v) => onChange({ language: v })}
          disabled={isLocked}
          showSearch
          options={[
            "javascript", "typescript", "python", "go", "rust", "java", "csharp",
            "ruby", "php", "swift", "kotlin", "bash", "sql", "html", "css",
            "json", "yaml", "markdown", "dockerfile", "graphql",
          ].map((l) => ({ value: l, label: l }))}
          style={{ width: 200 }}
          placeholder="language"
        />
        <TextArea
          value={block.content || ""}
          onChange={(e) => onChange({ content: e.target.value })}
          disabled={isLocked}
          rows={8}
          style={{ fontFamily: "var(--font-geist-mono), Menlo, Consolas, monospace", fontSize: 13 }}
          placeholder="// code..."
        />
      </Space>
    );
  }

  // ============== HTML ==============
  if (block.type === "html") {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <TextArea
          value={block.content || ""}
          onChange={(e) => onChange({ content: e.target.value })}
          disabled={isLocked}
          rows={6}
          style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 13 }}
          placeholder="<div class='custom'>HTML tuỳ chỉnh</div>"
        />
        <Text type="secondary" style={{ fontSize: 11 }}>
          ⚡ Dùng cho banner, embed, widget custom. Hỗ trợ Tailwind classes.
        </Text>
      </Space>
    );
  }

  // ============== IMAGE ==============
  if (block.type === "image") {
    return (
      <Row gutter={12}>
        <Col xs={24} md={12}>
          <Form layout="vertical" size="small" disabled={isLocked}>
            <Form.Item label="Image URL">
              <Input
                value={block.image?.url || ""}
                onChange={(e) => onChange({ image: { ...(block.image || {}), url: e.target.value } })}
                placeholder="https://... hoặc /uploads/..."
              />
            </Form.Item>
            <Form.Item label="Alt text (SEO)">
              <Input
                value={block.image?.alt || ""}
                onChange={(e) => onChange({ image: { ...(block.image || {}), alt: e.target.value } })}
                placeholder="Mô tả ảnh"
              />
            </Form.Item>
            <Form.Item label="Caption (chú thích)">
              <Input
                value={block.image?.caption || ""}
                onChange={(e) => onChange({ image: { ...(block.image || {}), caption: e.target.value } })}
                placeholder="Nguồn / chú thích"
              />
            </Form.Item>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item label="Width (px)">
                  <InputNumber
                    value={block.image?.width}
                    onChange={(v) => onChange({ image: { ...(block.image || {}), width: v ?? undefined } })}
                    style={{ width: "100%" }}
                    placeholder="auto"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Height (px)">
                  <InputNumber
                    value={block.image?.height}
                    onChange={(v) => onChange({ image: { ...(block.image || {}), height: v ?? undefined } })}
                    style={{ width: "100%" }}
                    placeholder="auto"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Link wrap (click vào ảnh đi đâu)">
              <Input
                value={block.image?.link || ""}
                onChange={(e) => onChange({ image: { ...(block.image || {}), link: e.target.value } })}
                placeholder="https://... (tuỳ chọn)"
              />
            </Form.Item>
          </Form>
        </Col>
        <Col xs={24} md={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>Preview:</Text>
          {block.image?.url ? (
            <div style={{ marginTop: 8 }}>
              <Image
                src={block.image.url}
                alt={block.image.alt || ""}
                style={{ maxWidth: "100%", borderRadius: 4 }}
                fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect fill='%23334155' width='300' height='150'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%2394a3b8'%3ENo image%3C/text%3E%3C/svg%3E"
              />
              {block.image.caption && (
                <Text type="secondary" style={{ display: "block", fontSize: 11, fontStyle: "italic", marginTop: 4 }}>
                  {block.image.caption}
                </Text>
              )}
            </div>
          ) : (
            <div
              style={{
                marginTop: 8,
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: 4,
                padding: 24,
                textAlign: "center",
                color: "#64748b",
              }}
            >
              No image URL
            </div>
          )}
        </Col>
      </Row>
    );
  }

  // ============== FAQ ==============
  if (block.type === "faq") {
    const faqs = block.faqs || [];
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        {faqs.map((f, i) => (
          <Card key={i} size="small" style={{ background: "#fafafa", border: "1px solid #e2e8f0" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Input
                value={f.question}
                onChange={(e) => {
                  const next = [...faqs];
                  next[i] = { ...next[i], question: e.target.value };
                  onChange({ faqs: next });
                }}
                disabled={isLocked}
                addonBefore="Q"
                placeholder="Câu hỏi"
              />
              <TextArea
                value={f.answer}
                onChange={(e) => {
                  const next = [...faqs];
                  next[i] = { ...next[i], answer: e.target.value };
                  onChange({ faqs: next });
                }}
                disabled={isLocked}
                rows={3}
                placeholder="Trả lời chi tiết 3-5 câu"
              />
              <Button
                size="small"
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => onChange({ faqs: faqs.filter((_, idx) => idx !== i) })}
                disabled={isLocked}
              >
                Xoá Q&A
              </Button>
            </Space>
          </Card>
        ))}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() =>
            onChange({ faqs: [...faqs, { question: "Câu hỏi?", answer: "Trả lời." }] })
          }
          disabled={isLocked}
          block
        >
          Thêm Q&A
        </Button>
      </Space>
    );
  }

  // ============== TABLE ==============
  if (block.type === "table") {
    const headers = block.table?.headers || [];
    const rows = block.table?.rows || [];
    const updateTable = (next: any) => onChange({ table: next });
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Headers (1 dòng/cột):
        </Text>
        <TextArea
          value={headers.join("\n")}
          onChange={(e) => updateTable({ headers: e.target.value.split("\n"), rows })}
          disabled={isLocked}
          rows={Math.max(2, headers.length)}
          placeholder="Cột 1\nCột 2\nCột 3"
        />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Rows (mỗi dòng 1 row, các cột phân cách bằng <code>|</code>):
        </Text>
        <TextArea
          value={rows.map((r: string[]) => r.join(" | ")).join("\n")}
          onChange={(e) =>
            updateTable({
              headers,
              rows: e.target.value.split("\n").filter(Boolean).map((r: string) => r.split("|").map((c: string) => c.trim())),
            })
          }
          disabled={isLocked}
          rows={Math.max(3, rows.length)}
          placeholder="A | B | C"
        />
      </Space>
    );
  }

  // ============== CALLOUT ==============
  if (block.type === "callout") {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Select
          value={block.callout?.type || "tip"}
          onChange={(v) => onChange({ callout: { ...(block.callout || {}), type: v } })}
          disabled={isLocked}
          options={[
            { value: "tip", label: "Tip" },
            { value: "info", label: "Info" },
            { value: "warning", label: "Warning" },
            { value: "error", label: "Error" },
            { value: "success", label: "Success" },
            { value: "note", label: "Note" },
          ]}
          style={{ width: 200 }}
        />
        <Input
          value={block.callout?.title || ""}
          onChange={(e) => onChange({ callout: { ...(block.callout || {}), title: e.target.value } })}
          disabled={isLocked}
          placeholder="Tiêu đề callout (vd: Pro Tip)"
        />
        <TextArea
          value={block.callout?.content || ""}
          onChange={(e) => onChange({ callout: { ...(block.callout || {}), content: e.target.value } })}
          disabled={isLocked}
          rows={3}
          placeholder="Nội dung callout..."
        />
      </Space>
    );
  }

  // ============== STATS ==============
  if (block.type === "stats") {
    const items = block.stats?.items || [];
    const updateStats = (patch: any) => onChange({ stats: { ...(block.stats || { items: [] }), ...patch } });
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Form.Item label="Layout columns" style={{ marginBottom: 8 }}>
          <Select
            value={block.stats?.columns || items.length || 4}
            onChange={(v) => updateStats({ columns: v })}
            disabled={isLocked}
            options={[2, 3, 4, 5, 6].map((c) => ({ value: c, label: `${c} columns` }))}
            style={{ width: 200 }}
          />
        </Form.Item>
        {items.map((item, i) => (
          <Card key={i} size="small" style={{ background: "#fafafa" }}>
            <Row gutter={8}>
              <Col xs={24} md={6}>
                <Input
                  value={item.value}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...next[i], value: e.target.value };
                    updateStats({ items: next });
                  }}
                  disabled={isLocked}
                  placeholder="500+"
                  addonBefore="Value"
                />
              </Col>
              <Col xs={24} md={8}>
                <Input
                  value={item.label}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...next[i], label: e.target.value };
                    updateStats({ items: next });
                  }}
                  disabled={isLocked}
                  placeholder="Active users"
                  addonBefore="Label"
                />
              </Col>
              <Col xs={12} md={4}>
                <Input
                  value={item.icon || ""}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...next[i], icon: e.target.value };
                    updateStats({ items: next });
                  }}
                  disabled={isLocked}
                  placeholder="Material icon"
                  addonBefore="Icon"
                />
              </Col>
              <Col xs={8} md={4}>
                <ColorPicker
                  value={item.color}
                  onChange={(_, hex) => {
                    const next = [...items];
                    next[i] = { ...next[i], color: hex };
                    updateStats({ items: next });
                  }}
                  showText
                />
              </Col>
              <Col xs={4} md={2}>
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => updateStats({ items: items.filter((_, idx) => idx !== i) })}
                  disabled={isLocked}
                />
              </Col>
            </Row>
          </Card>
        ))}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() =>
            updateStats({
              items: [...items, { value: "100", label: "Items", color: "#10b981" }],
            })
          }
          disabled={isLocked}
          block
        >
          Thêm stat item
        </Button>
      </Space>
    );
  }

  // ============== DIVIDER ==============
  if (block.type === "divider") {
    return (
      <Row gutter={12}>
        <Col xs={12} md={8}>
          <Form.Item label="Style" style={{ marginBottom: 0 }}>
            <Select
              value={block.divider?.style || "solid"}
              onChange={(v) => onChange({ divider: { ...(block.divider || {}), style: v } })}
              disabled={isLocked}
              options={[
                { value: "solid", label: "Solid line" },
                { value: "dashed", label: "Dashed" },
                { value: "dotted", label: "Dotted" },
                { value: "double", label: "Double" },
                { value: "gradient", label: "Gradient" },
                { value: "stars", label: "Stars" },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={12} md={8}>
          <Form.Item label="Color" style={{ marginBottom: 0 }}>
            <ColorPicker
              value={block.divider?.color || "#334155"}
              onChange={(_, hex) => onChange({ divider: { ...(block.divider || {}), color: hex } })}
              showText
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Width (%)" style={{ marginBottom: 0 }}>
            <Slider
              min={10}
              max={100}
              value={block.divider?.width || 100}
              onChange={(v) => onChange({ divider: { ...(block.divider || {}), width: v } })}
              disabled={isLocked}
            />
          </Form.Item>
        </Col>
      </Row>
    );
  }

  // ============== EMBED ==============
  if (block.type === "embed") {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Select
          value={block.embed?.provider || "youtube"}
          onChange={(v) => onChange({ embed: { ...(block.embed || {}), provider: v } })}
          disabled={isLocked}
          options={[
            { value: "youtube", label: "YouTube" },
            { value: "twitter", label: "X (Twitter)" },
            { value: "tiktok", label: "TikTok" },
            { value: "vimeo", label: "Vimeo" },
            { value: "facebook", label: "Facebook" },
            { value: "instagram", label: "Instagram" },
            { value: "iframe", label: "Custom iframe" },
          ]}
          style={{ width: 200 }}
        />
        <Input
          value={block.embed?.url || ""}
          onChange={(e) => onChange({ embed: { ...(block.embed || {}), url: e.target.value } })}
          disabled={isLocked}
          placeholder="https://youtube.com/watch?v=... hoặc https://x.com/..."
          addonBefore="URL"
        />
        <Input
          value={block.embed?.caption || ""}
          onChange={(e) => onChange({ embed: { ...(block.embed || {}), caption: e.target.value } })}
          disabled={isLocked}
          placeholder="Caption (tuỳ chọn)"
          addonBefore="Caption"
        />
      </Space>
    );
  }

  // ============== HERO ==============
  if (block.type === "hero") {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Input
          value={block.hero?.title || ""}
          onChange={(e) => onChange({ hero: { ...(block.hero || {}), title: e.target.value } })}
          disabled={isLocked}
          placeholder="Hero title"
          size="large"
          style={{ fontWeight: 700 }}
        />
        <Input
          value={block.hero?.subtitle || ""}
          onChange={(e) => onChange({ hero: { ...(block.hero || {}), subtitle: e.target.value } })}
          disabled={isLocked}
          placeholder="Subtitle"
        />
        <Row gutter={8}>
          <Col xs={12}>
            <Select
              value={block.hero?.align || "center"}
              onChange={(v) => onChange({ hero: { ...(block.hero || {}), align: v } })}
              disabled={isLocked}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={12}>
            <Select
              value={block.hero?.height || "60vh"}
              onChange={(v) => onChange({ hero: { ...(block.hero || {}), height: v } })}
              disabled={isLocked}
              options={["40vh", "50vh", "60vh", "70vh", "80vh", "90vh", "100vh"].map((h) => ({
                value: h,
                label: `Height: ${h}`,
              }))}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
        <Input
          value={block.hero?.cta?.text || ""}
          onChange={(e) =>
            onChange({ hero: { ...(block.hero || {}), cta: { ...(block.hero?.cta || { url: "" }), text: e.target.value } } })
          }
          disabled={isLocked}
          placeholder="CTA button text"
          addonBefore="CTA"
        />
        <Input
          value={block.hero?.cta?.url || ""}
          onChange={(e) =>
            onChange({ hero: { ...(block.hero || {}), cta: { ...(block.hero?.cta || { text: "" }), url: e.target.value } } })
          }
          disabled={isLocked}
          placeholder="CTA URL"
          addonBefore="URL"
        />
      </Space>
    );
  }

  return <Text type="warning">Loại block "{block.type}" — chưa có editor</Text>;
}

// Block type options — exported for use in detail page
export const BLOCK_TYPES = [
  { value: "paragraph", label: "Paragraph" },
  { value: "heading", label: "Heading" },
  { value: "list", label: "List" },
  { value: "table", label: "Table" },
  { value: "quote", label: "Quote" },
  { value: "code", label: "Code" },
  { value: "html", label: "HTML" },
  { value: "image", label: "Image" },
  { value: "faq", label: "FAQ" },
  { value: "callout", label: "Callout" },
  { value: "stats", label: "Stats" },
  { value: "divider", label: "Divider" },
  { value: "embed", label: "Embed" },
  { value: "hero", label: "Hero" },
];

export function newBlock(type: string, order: number): ContentBlock {
  const id = String(Date.now()) + Math.random().toString(36).slice(2, 6);
  switch (type) {
    case "heading":
      return { id, type, order, level: 2, text: "Tiêu đề mới" };
    case "list":
      return { id, type, order, list: { type: "unordered", items: ["Item 1"] } };
    case "table":
      return {
        id,
        type,
        order,
        table: { headers: ["Col 1", "Col 2"], rows: [["", ""]] },
      };
    case "quote":
      return { id, type, order, content: "Trích dẫn...", author: "" };
    case "code":
      return { id, type, order, content: "console.log('hi')", language: "javascript" };
    case "html":
      return { id, type, order, content: "<div>HTML</div>" };
    case "image":
      return { id, type, order, image: { url: "", alt: "" } };
    case "faq":
      return { id, type, order, faqs: [{ question: "Câu hỏi?", answer: "Trả lời." }] };
    case "callout":
      return { id, type, order, callout: { type: "tip", title: "Pro Tip", content: "Nội dung tip..." } };
    case "stats":
      return {
        id,
        type,
        order,
        stats: {
          columns: 4,
          items: [
            { value: "100+", label: "Items", color: "#10b981" },
            { value: "5x", label: "Faster", color: "#f59e0b" },
            { value: "99.9%", label: "Uptime", color: "#3b82f6" },
            { value: "24/7", label: "Support", color: "#8b5cf6" },
          ],
        },
      };
    case "divider":
      return { id, type, order, divider: { style: "solid", color: "#334155", width: 100 } };
    case "embed":
      return { id, type, order, embed: { provider: "youtube", url: "" } };
    case "hero":
      return {
        id,
        type,
        order,
        hero: { title: "Hero", subtitle: "Subtitle", align: "center", height: "60vh" },
      };
    default:
      return { id, type: "paragraph", order, content: "Đoạn văn mới." };
  }
}
