# 專案規則

## 一般規則

- 總是使用繁體中文回應。
- 提交 Git 時所有的提交訊息請使用繁體中文。

## Git Commit 規範

本專案遵循 [AngularJS Git Commit Message Conventions](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)。

### 格式

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Type

必須是以下其中之一：

- **feat**: 新功能 (A new feature)
- **fix**: 修復 bug (A bug fix)
- **docs**: 文件變更 (Documentation only changes)
- **style**: 程式碼格式調整，不影響程式邏輯 (Changes that do not affect the meaning of the code)
- **refactor**: 重構 (A code change that neither fixes a bug nor adds a feature)
- **perf**: 效能優化 (A code change that improves performance)
- **test**: 新增或修改測試 (Adding missing tests or correcting existing tests)
- **chore**: 建置過程或輔助工具的變動 (Changes to the build process or auxiliary tools and libraries such as documentation generation)

### Scope

選填，用於說明變更的範圍（例如：`cli`, `utils`, `core` 等）。

### Subject

- 使用繁體中文。
- 簡潔扼要地描述變更內容。
- 結尾不需要句號。

### Body

- 使用繁體中文。
- 詳細描述變更的動機與內容。

### Footer

- 標註 Breaking Changes。
- 關聯 Issue（例如：`Closes #123`）。
