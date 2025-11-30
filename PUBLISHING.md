# 發布指南

本文件說明如何將 `@alexcode-cc/git-commits` 工具集發布到 GitHub 與 npm。

## 前置準備

1.  **GitHub 帳號**：確保您擁有 `alexcode-cc` 帳號的權限。
2.  **npm 帳號**：確保您已註冊 npm 帳號並登入。
3.  **Git 設定**：確保本地 Git 已設定正確的遠端儲存庫。

## 1. 設定 Git 遠端儲存庫

如果您尚未設定 GitHub 遠端儲存庫，請執行以下指令：

```bash
# 移除舊的 origin (如果有的話)
git remote remove origin

# 新增 GitHub origin
git remote add origin git@github.com:alexcode-cc/git-commits.git

# 確認設定
git remote -v
```

## 2. 登入 npm

在終端機執行以下指令登入 npm：

```bash
npm login
```

依據提示輸入您的使用者名稱、密碼與 Email。

## 3. 準備發布版本

在發布新版本前，請確保所有變更都已提交 (commit)。

### 更新版本號

使用 `npm version` 指令來更新版本號，這會自動修改 `package.json` 並建立一個 git tag。

```bash
# 更新補丁版本 (例如 1.0.0 -> 1.0.1)
npm version patch

# 或更新次要版本 (例如 1.0.0 -> 1.1.0)
npm version minor

# 或更新主要版本 (例如 1.0.0 -> 2.0.0)
npm version major
```

## 4. 發布到 npm

執行以下指令將套件發布到 npm：

```bash
npm publish --access public
```

> **注意**：由於本專案為 Scoped Package (`@alexcode-cc/git-commits`)，發布時建議加上 `--access public` 參數，確保套件為公開存取。

## 5. 推送到 GitHub

將程式碼與標籤推送到 GitHub：

```bash
git push origin main --tags
```

## 常見問題

### 權限錯誤

如果遇到權限錯誤，請確認：
1.  您是否已登入正確的 npm 帳號。
2.  您是否有權限發布該套件名稱。
