## 剧本新增流程

1. 复制 `template.ts` 为新文件（建议使用英文或拼音命名）。
2. 修改 `id/title/description/systemPrompt` 等字段。
3. 把封面图放入 `public/images/`，并填写 `coverImage` 路径。
4. 在 `index.ts` 里引入并加入 `scripts` 数组。

## 关键约定

- `id` 必须唯一，且用于路由 `/script/[id]`。
- `systemPrompt` 请包含剧情规则，并使用 `[UPDATE]{...}[/UPDATE]` 输出数值变化。
- 如果需要动态快捷指令，请让模型输出 `[ACTIONS][\"指令1\",\"指令2\"][/ACTIONS]`。
- `initialStats` 会显示在对话页状态栏。
